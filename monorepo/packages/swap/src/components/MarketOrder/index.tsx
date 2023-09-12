/* eslint-disable max-lines */
import { Box, Button, Text, TextInput } from '@honeycomb/core';
import {
  CAVAX,
  CurrencyAmount,
  ElixirTrade,
  JSBI,
  Token,
  TokenAmount,
  Trade,
  WAVAX,
  currencyEquals,
} from '@pangolindex/sdk';
import {
  DEFAULT_TOKEN_LISTS_SELECTED,
  MixPanelEvents,
  TRUSTED_TOKEN_ADDRESSES,
  ZERO_ADDRESS,
  isTokenOnList,
  maxAmountSpend,
  unwrappedToken,
  useChainId,
  useENS,
  useMixpanel,
  usePangolinWeb3,
  useTranslation,
  validateAddressMapping,
  wrappedCurrency,
} from '@honeycomb/shared';
import {
  ApprovalState,
  useApproveCallbackFromTradeHook,
  useCurrency,
  useExpertModeManager,
  useHederaApproveCallback,
  useSelectedTokenList,
  useTokenHook,
  useTokenList,
  useUserSlippageTolerance,
  useWalletModalToggle,
} from '@honeycomb/state-hooks';
import { SelectTokenDrawer } from '@pangolindex/token-drawer';
import { Hedera, hederaFn } from '@honeycomb/wallet-connectors';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RefreshCcw } from 'react-feather';
import { ThemeContext } from 'styled-components';
import confirmPriceImpactWithoutFee from 'src/confirmPriceImpactWithoutFee';
import { SwapTypes } from 'src/constants';
import { useSwapCallbackHook } from 'src/hooks/useSwapCallback';
import useToggledVersion, { Version } from 'src/hooks/useToggledVersion';
import { useWrapCallbackHook } from 'src/hooks/useWrapCallback';
import { WrapType } from 'src/hooks/useWrapCallback/constant';
import { Field, LimitNewField } from 'src/state/atom';
import { useGelatoLimitOrdersHook } from 'src/state/hooks';
import {
  useDaasFeeTo,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useIsSelectedAEBToken,
  useSwapActionHandlers,
  useSwapState,
} from 'src/state/hooks/common';
import { useHederaSwapTokenAssociated } from 'src/state/hooks/hedera';
import { computeTradePriceBreakdown, warningSeverity } from 'src/utils/prices';
import ConfirmSwapDrawer from '../ConfirmSwapDrawer';
import SwapSettingsDrawer from '../Settings';
import SwapDetailInfo from '../SwapDetailInfo';
import SwapRoute from '../SwapRoute';
import TokenWarningModal from '../TokenWarningModal';
import TradeOption from '../TradeOption';
import { DeprecatedWarning } from '../Warning';
import { ArrowWrapper, CurrencyInputTextBox, LinkStyledButton, PValue, Root, SwapWrapper } from './styled';

interface Props {
  swapType: string;
  setSwapType: (value: SwapTypes) => void;
  isLimitOrderVisible: boolean;
  isTWAPOrderVisible: boolean;
  showSettings: boolean;
  partnerDaaS?: string;
  defaultInputAddress?: string;
  defaultOutputAddress?: string;
}

const MarketOrder: React.FC<Props> = ({
  swapType,
  setSwapType,
  isLimitOrderVisible,
  isTWAPOrderVisible,
  showSettings,
  partnerDaaS = ZERO_ADDRESS,
  defaultInputAddress,
  defaultOutputAddress,
}) => {
  // const [isRetryDrawerOpen, setIsRetryDrawerOpen] = useState(false);
  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const [tokenDrawerType, setTokenDrawerType] = useState(Field.INPUT);
  const { t } = useTranslation();
  const percentageValue = [25, 50, 75, 100];

  const loadedUrlParams = useDefaultsFromURLSearch();

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false);
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const useToken = useTokenHook[chainId];
  const theme = useContext(ThemeContext);
  const useWrapCallback = useWrapCallbackHook[chainId];
  const useApproveCallbackFromTrade = useApproveCallbackFromTradeHook[chainId];
  const useSwapCallback = useSwapCallbackHook[chainId];
  const useGelatoLimitOrders = useGelatoLimitOrdersHook[chainId];

  const checkRecipientAddress = validateAddressMapping[chainId];

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // for expert mode
  // const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager();

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance();

  const [feeTo, setFeeTo] = useDaasFeeTo();

  const mixpanel = useMixpanel();

  useEffect(() => {
    if (feeTo === partnerDaaS) return;
    setFeeTo(partnerDaaS);
  }, [feeTo, partnerDaaS]);

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    isLoading: isLoadingSwap,
  } = useDerivedSwapInfo();

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
    executing,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);

  const {
    associate: onAssociate,
    isLoading: isLoadingAssociate,
    hederaAssociated: isHederaTokenAssociated,
  } = useHederaSwapTokenAssociated();

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENS(recipient);
  const toggledVersion = useToggledVersion();
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade,
  };
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion];
  // const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]

  // const betterTradeLinkVersion: Version | undefined = undefined
  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      };

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers(chainId);
  const {
    handlers: { handleCurrencySelection: onLimitCurrencySelection },
  } = useGelatoLimitOrders();

  const whbar = WAVAX[chainId];
  const whbarContract = hederaFn.tokenToContractId(hederaFn.hederaId(whbar.address));
  const [approvalWrappedState, onApproveWrapped] = useHederaApproveCallback(
    chainId,
    Hedera.isHederaChain(chainId) ? parsedAmount : undefined,
    Hedera.isHederaChain(chainId) ? whbarContract : undefined,
  );

  const isValid = !swapInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const inputCurrency = currencies[Field.INPUT];
  const outputCurrency = currencies[Field.OUTPUT];

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  // setting default tokens
  const defaultInputToken = useToken(defaultInputAddress);
  const defaultInputCurrency = defaultInputToken ? unwrappedToken(defaultInputToken as Token, chainId) : undefined;
  const defaultOututToken = useToken(defaultOutputAddress);
  const defaultOutputCurrency = defaultOututToken ? unwrappedToken(defaultOututToken as Token, chainId) : undefined;

  useEffect(() => {
    if (defaultInputCurrency) {
      onCurrencySelection(Field.INPUT, defaultInputCurrency);
    }
    if (defaultOutputCurrency) {
      onCurrencySelection(Field.OUTPUT, defaultOutputCurrency);
    }
  }, [chainId, defaultInputAddress, defaultOutputAddress, defaultInputCurrency, defaultOutputCurrency]);

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean;
    tradeToConfirm: Trade | ElixirTrade | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const route = trade?.route;
  const tradePrice = trade?.executionPrice;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );
  const noRoute = !route;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(chainId, trade as Trade, allowedSlippage);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    } else if (approval !== ApprovalState.APPROVED) {
      setApprovalSubmitted(false);
    }
  }, [approval]);

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(chainId, currencyBalances[Field.INPUT]);

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade as Trade,
    recipient,
    allowedSlippage,
  );

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return;
    }
    if (!swapCallback) {
      return;
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined });
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash });
        setSelectedPercentage(0);
        if (trade) {
          const path = trade.route.path;
          const tokenA = path[0];
          const tokenB = path[path.length - 1];
          mixpanel.track(MixPanelEvents.SWAP, {
            chainId: chainId,
            tokenA: inputCurrency?.symbol,
            tokenB: outputCurrency?.symbol,
            tokenA_Address: tokenA.address,
            tokenB_Address: tokenB.address,
          });
        }
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        });

        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade]);

  const handleWrap = useCallback(() => {
    try {
      onWrap?.();
      setSelectedPercentage(0);
    } catch (error) {
      console.error(error);
    }
  }, [onWrap, setSelectedPercentage]);

  const handleSelectTokenDrawerClose = useCallback(() => {
    setIsTokenDrawerOpen(false);
  }, [setIsTokenDrawerOpen]);

  // errors
  // const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '');
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  // const handleMaxInput = useCallback(() => {
  //   maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  // }, [maxAmountInput, onUserInput])

  const onCurrencySelect = useCallback(
    (currency) => {
      if (tokenDrawerType === Field.INPUT) {
        setApprovalSubmitted(false); // reset 2 step UI for approvals
        setSelectedPercentage(0);
        handleTypeInput('');
        if (
          Hedera.isHederaChain(chainId) &&
          currencies[Field.OUTPUT] === CAVAX[chainId] &&
          !currencyEquals(currency, WAVAX[chainId])
        ) {
          onCurrencySelection(Field.OUTPUT, WAVAX[chainId]);
        }
      }

      onCurrencySelection(tokenDrawerType, currency);

      // here need to add isToken because in Galato hook require this variable to select currency
      const newCurrency = { ...currency };
      if (currency?.symbol === CAVAX[chainId].symbol) {
        newCurrency.isNative = true;
      } else {
        newCurrency.isToken = true;
      }
      onLimitCurrencySelection(
        (tokenDrawerType === Field.INPUT ? LimitNewField.INPUT : LimitNewField.OUTPUT) as any,
        newCurrency,
      );
    },
    [tokenDrawerType, onCurrencySelection],
  );

  const isAEBToken = useIsSelectedAEBToken();

  const selectedTokens = useSelectedTokenList();
  const whitelistedTokens = useTokenList(DEFAULT_TOKEN_LISTS_SELECTED);

  const isTrustedToken = useCallback(
    (token: Token) => {
      if (!chainId || !selectedTokens) return true; // Assume trusted at first to avoid flashing a warning
      return (
        TRUSTED_TOKEN_ADDRESSES[chainId].includes(token.address) || // trust token from manually whitelisted token
        isTokenOnList(selectedTokens, chainId, token) || // trust all tokens from selected token list by user
        isTokenOnList(whitelistedTokens, chainId, token) // trust all defi + AB tokens
      );
    },
    [chainId, selectedTokens, whitelistedTokens],
  );

  const closeSwapSettings = useCallback(() => {
    setOpenSettings(false);
  }, [setOpenSettings]);

  const openSwapSettings = useCallback(() => {
    setOpenSettings(true);
  }, [setOpenSettings]);

  const showRoute = Boolean(trade && trade?.route?.path?.length > 2);

  {
    /* Settings */
  }
  if (openSettings && showSettings) {
    return (
      <Box minHeight={450}>
        <SwapSettingsDrawer isOpen={openSettings} close={closeSwapSettings} />
      </Box>
    );
  }

  const renderWrapButtonText = () => {
    if (wrapInputError) {
      return wrapInputError;
    } else if (executing) {
      return `${t('common.loading')}`;
    } else if (wrapType === WrapType.WRAP) {
      return `${t('swapPage.wrap')}`;
    } else if (wrapType === WrapType.UNWRAP) {
      return `${t('swapPage.unwrap')}`;
    }
  };

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal}>
          {t('swapPage.connectWallet')}
        </Button>
      );
    }

    if (!isHederaTokenAssociated) {
      return (
        <Button variant="primary" isDisabled={Boolean(isLoadingAssociate)} onClick={onAssociate}>
          {isLoadingAssociate
            ? `${t('pool.associating')}`
            : `${t('pool.associate')} ` + currencies[Field.OUTPUT]?.symbol}
        </Button>
      );
    }
    if (showWrap && Hedera.isHederaChain(chainId) && wrapType === WrapType.UNWRAP) {
      return (
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box mr="10px" width="100%">
            <Button
              variant={approvalWrappedState === ApprovalState.APPROVED ? 'confirm' : 'primary'}
              onClick={() => onApproveWrapped()}
              isDisabled={approvalWrappedState !== ApprovalState.NOT_APPROVED || approvalSubmitted}
              loading={approvalWrappedState === ApprovalState.PENDING}
              loadingText={t('swapPage.approving')}
            >
              {approvalWrappedState === ApprovalState.APPROVED
                ? `${t('swapPage.approved')}`
                : `${t('swapPage.approve')} ` + currencies[Field.INPUT]?.symbol}
            </Button>
          </Box>

          <Button
            variant="primary"
            isDisabled={
              Boolean(wrapInputError) || Boolean(executing) || approvalWrappedState !== ApprovalState.APPROVED
            }
            onClick={handleWrap}
          >
            {renderWrapButtonText()}
          </Button>
        </Box>
      );
    }
    if (showWrap) {
      return (
        <Button variant="primary" isDisabled={Boolean(wrapInputError) || Boolean(executing)} onClick={handleWrap}>
          {renderWrapButtonText()}
        </Button>
      );
    }
    if (
      (isLoadingSwap && !swapInputError) ||
      (userHasSpecifiedInputOutput && trade && approval === ApprovalState.UNKNOWN)
    ) {
      return (
        <Button variant="primary" isDisabled>
          {t('common.loading')}
        </Button>
      );
    }
    if (noRoute && userHasSpecifiedInputOutput) {
      return (
        <Button variant="primary" isDisabled>
          {t('swapPage.insufficientLiquidity')}
        </Button>
      );
    }

    if (showApproveFlow) {
      return (
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box mr="10px" width="100%">
            <Button
              variant={approval === ApprovalState.APPROVED ? 'confirm' : 'primary'}
              onClick={() => approveCallback()}
              isDisabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
              loading={approval === ApprovalState.PENDING}
              loadingText={t('swapPage.approving')}
            >
              {approvalSubmitted && approval === ApprovalState.APPROVED
                ? `${t('swapPage.approved')}`
                : `${t('swapPage.approve')} ` + currencies[Field.INPUT]?.symbol}
            </Button>
          </Box>

          <Button
            variant="primary"
            onClick={() => {
              setSwapState({
                tradeToConfirm: trade,
                attemptingTxn: false,
                swapErrorMessage: undefined,
                showConfirm: true,
                txHash: undefined,
              });
            }}
            id="swap-button"
            isDisabled={!isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)}
            // error={isValid && priceImpactSeverity > 2}
          >
            {priceImpactSeverity > 3 && !isExpertMode
              ? `${t('swapPage.priceImpactHigh')}`
              : `${t('swapPage.swap')}` + `${priceImpactSeverity > 2 ? ` ${t('swapPage.anyway')}` : ''}`}
          </Button>
        </Box>
      );
    }

    return (
      <Button
        variant="primary"
        onClick={() => {
          setSwapState({
            tradeToConfirm: trade,
            attemptingTxn: false,
            swapErrorMessage: undefined,
            showConfirm: true,
            txHash: undefined,
          });
        }}
        id="swap-button"
        isDisabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError || !!swapInputError}
        backgroundColor={isValid && priceImpactSeverity > 2 && isExpertMode ? 'primary' : undefined}
      >
        {swapInputError
          ? swapInputError
          : priceImpactSeverity > 3 && !isExpertMode
          ? `${t('swapPage.priceImpactHigh')}`
          : `${t('swapPage.swap')}` + `${priceImpactSeverity > 2 ? ` ${t('swapPage.anyway')}` : ''}`}
      </Button>
    );
  };

  const renderPercentage = () => {
    return (
      <Box display="flex" pb="5px">
        {percentageValue.map((value, index) => (
          <PValue
            key={index}
            isActive={selectedPercentage === value}
            onClick={() => {
              setSelectedPercentage(value);

              if (maxAmountInput) {
                const multipyAmount = JSBI.multiply(maxAmountInput?.raw, JSBI.BigInt(value));
                const divideAmount = JSBI.divide(multipyAmount, JSBI.BigInt(100));
                const token = wrappedCurrency(maxAmountInput?.currency ?? undefined, chainId) as Token;
                const newFinalAmount = new TokenAmount(token, divideAmount);

                onUserInput(Field.INPUT, newFinalAmount.toExact());
              }
            }}
          >
            {value}%
          </PValue>
        ))}
      </Box>
    );
  };

  return (
    <Root>
      <TradeOption
        swapType={swapType}
        setSwapType={setSwapType}
        isLimitOrderVisible={isLimitOrderVisible}
        isTWAPOrderVisible={isTWAPOrderVisible}
        showSettings={showSettings}
        openSwapSettings={openSwapSettings}
      />

      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning && !urlLoadedTokens.every(isTrustedToken)}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />

      <SwapWrapper showRoute={showRoute}>
        <Box p={10}>
          {isAEBToken && <DeprecatedWarning />}

          <CurrencyInputTextBox
            label={
              independentField === Field.OUTPUT && !showWrap && trade
                ? `${t('swapPage.fromEstimated')}`
                : `${t('swapPage.from')}`
            }
            value={formattedAmounts[Field.INPUT]}
            onChange={(value: any) => {
              setSelectedPercentage(0);
              handleTypeInput(value as any);
            }}
            onTokenClick={() => {
              setTokenDrawerType(Field.INPUT);
              setIsTokenDrawerOpen(true);
            }}
            currency={inputCurrency}
            fontSize={24}
            isNumeric={true}
            placeholder="0.00"
            id="swap-currency-input"
            addonLabel={renderPercentage()}
          />

          <Box width="100%" textAlign="center" alignItems="center" display="flex" justifyContent={'center'} mt={10}>
            <ArrowWrapper
              onClick={() => {
                setApprovalSubmitted(false); // reset 2 step UI for approvals
                setSelectedPercentage(0); // reset selected percentage
                onSwitchTokens();
              }}
            >
              <RefreshCcw size="16" color={theme.swapWidget?.interactiveColor} />
            </ArrowWrapper>
          </Box>

          <CurrencyInputTextBox
            label={
              independentField === Field.INPUT && !showWrap && trade
                ? `${t('swapPage.toEstimated')}`
                : `${t('swapPage.to')}`
            }
            value={formattedAmounts[Field.OUTPUT]}
            onChange={(value: any) => {
              setSelectedPercentage(0);
              handleTypeOutput(value as any);
            }}
            onTokenClick={() => {
              setTokenDrawerType(Field.OUTPUT);
              setIsTokenDrawerOpen(true);
            }}
            currency={outputCurrency}
            fontSize={24}
            isNumeric={true}
            placeholder="0.00"
            id="swap-currency-output"
            addonLabel={
              tradePrice && (
                <Text color="swapWidget.secondary" fontSize={16}>
                  {t('swapPage.price')}: {tradePrice?.toFixed(6)} {tradePrice?.quoteCurrency?.symbol}
                </Text>
              )
            }
          />

          {recipient === null && !showWrap && isExpertMode ? (
            <Box display="flex" flexDirection="column" marginTop={10}>
              <LinkStyledButton
                id="add-recipient-button"
                onClick={() => onChangeRecipient('')}
                style={{ alignSelf: 'end' }}
              >
                + {t('swapPage.addRecipient')}
              </LinkStyledButton>
            </Box>
          ) : null}

          {recipient !== null && !showWrap ? (
            <Box display="flex" flexDirection="column" marginTop={10} marginBottom={10}>
              <LinkStyledButton
                id="add-recipient-button"
                onClick={() => onChangeRecipient(null)}
                style={{ alignSelf: 'end' }}
              >
                - {t('swapPage.removeRecipient')}
              </LinkStyledButton>
              <TextInput
                label="Recipient"
                placeholder="Wallet Address"
                value={recipient}
                onChange={(value) => {
                  const withoutSpaces = value.replace(/\s+/g, '');
                  onChangeRecipient(withoutSpaces);
                }}
                addonLabel={
                  recipient &&
                  !checkRecipientAddress(recipient) && <Text color="warning"> {t('swapPage.invalidAddress')}</Text>
                }
              />
            </Box>
          ) : null}

          {trade && <SwapDetailInfo trade={trade} />}

          <Box width="100%" mt={10}>
            {renderButton()}
          </Box>
        </Box>
      </SwapWrapper>

      {trade && showRoute && <SwapRoute trade={trade} />}
      {/* Retries Drawer */}
      {/* <RetryDrawer isOpen={isRetryDrawerOpen} onClose={() => setIsRetryDrawerOpen(false)} /> */}
      {/* Token Drawer */}

      {isTokenDrawerOpen && (
        <SelectTokenDrawer
          isOpen={isTokenDrawerOpen}
          onClose={handleSelectTokenDrawerClose}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={tokenDrawerType === Field.INPUT ? inputCurrency : outputCurrency}
          otherSelectedCurrency={tokenDrawerType === Field.INPUT ? outputCurrency : inputCurrency}
          seletedField={tokenDrawerType}
        />
      )}

      {/* Confirm Swap Drawer */}
      {trade && showConfirm && (
        <ConfirmSwapDrawer
          isOpen={showConfirm}
          trade={trade}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          recipient={recipient}
          allowedSlippage={allowedSlippage}
          onConfirm={handleSwap}
          swapErrorMessage={swapErrorMessage}
          onClose={handleConfirmDismiss}
        />
      )}
    </Root>
  );
};
export default MarketOrder;
/* eslint-enable max-lines */
