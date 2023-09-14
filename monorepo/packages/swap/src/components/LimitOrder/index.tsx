/* eslint-disable max-lines */
import { Box, Button, Text, ToggleButtons } from '@honeycomb-finance/core';
import {
  MixPanelEvents,
  NATIVE,
  capitalizeWord,
  unwrappedToken,
  useChainId,
  useMixpanel,
  usePangolinWeb3,
  useTranslation,
} from '@honeycomb-finance/shared';
import {
  ApprovalState,
  useTokenHook,
  useTransactionAdder,
  useUserSlippageTolerance,
  useWalletModalToggle,
} from '@honeycomb-finance/state-hooks';
import { SelectTokenDrawer } from '@honeycomb-finance/token-drawer';
import { CAVAX, JSBI, Token, TokenAmount, Trade } from '@pangolindex/sdk';
import { CurrencyAmount, Currency as UniCurrency } from '@uniswap/sdk-core';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Divide, RefreshCcw, X } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { SwapTypes } from 'src/constants';
import { useApproveCallbackFromInputCurrencyAmount } from 'src/hooks/useApproveCallbackFromInputCurrencyAmount';
import { LimitField, LimitNewField } from 'src/state/atom';
import { useGelatoLimitOrdersHook } from 'src/state/hooks';
import { useIsSelectedAEBToken, useSwapActionHandlers } from 'src/state/hooks/common';
import { galetoMaxAmountSpend } from 'src/utils/galetoMaxAmountSpend';
import { wrappedGelatoCurrency } from 'src/utils/wrappedGelatoCurrency';
import ConfirmLimitOrderDrawer from '../ConfirmLimitOrderDrawer';
import LimitOrderDetailInfo from '../LimitOrderDetailInfo';
import TradeOption from '../TradeOption';
import { DeprecatedWarning } from '../Warning';
import { ArrowWrapper, CurrencyInputTextBox, InputText, PValue, Root, SwapWrapper } from './styled';

enum Rate {
  DIV = 'DIV',
  MUL = 'MUL',
}

interface Props {
  swapType: string;
  setSwapType: (value: SwapTypes) => void;
  isLimitOrderVisible: boolean;
  isTWAPOrderVisible: boolean;
  defaultInputAddress?: string;
  defaultOutputAddress?: string;
}

const LimitOrder: React.FC<Props> = ({
  swapType,
  setSwapType,
  isLimitOrderVisible,
  isTWAPOrderVisible,
  defaultInputAddress,
  defaultOutputAddress,
}) => {
  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const [tokenDrawerType, setTokenDrawerType] = useState(LimitNewField.INPUT);
  const [activeTab, setActiveTab] = useState<'SELL' | 'BUY'>('SELL');
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const useToken = useTokenHook[chainId];

  const useGelatoLimitOrders = useGelatoLimitOrdersHook[chainId];
  const theme = useContext(ThemeContext);

  const percentageValue = [25, 50, 75, 100];

  const { t } = useTranslation();

  const {
    handlers: {
      handleInput: onUserInput,
      handleRateType,
      handleCurrencySelection: onCurrencySelection,
      handleSwitchTokens: onSwitchTokens,
      handleLimitOrderSubmission,
    },
    derivedOrderInfo: {
      parsedAmounts,
      currencies,
      currencyBalances,
      trade,
      formattedAmounts,
      inputError: swapInputError,
      rawAmounts,
      price,
    },
    orderState: { independentField, rateType },
  } = useGelatoLimitOrders();

  const { onCurrencySelection: onSwapCurrencySelection } = useSwapActionHandlers(chainId);

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance();
  const recipient = account ?? null;
  const isValid = !swapInputError;

  const gelatoInputCurrency = currencies[LimitField.INPUT] as any;
  const gelatoOutputCurrency = currencies[LimitField.OUTPUT] as any;

  const inputTokenInfo = gelatoInputCurrency?.tokenInfo;
  const outputTokenInfo = gelatoOutputCurrency?.tokenInfo;

  const getInputCurrency = () => {
    if (gelatoInputCurrency && gelatoInputCurrency?.symbol === CAVAX[chainId].symbol) {
      return CAVAX[chainId];
    } else if (inputTokenInfo && inputTokenInfo?.symbol === CAVAX[chainId].symbol) {
      return CAVAX[chainId];
    } else if (inputTokenInfo) {
      return new Token(
        inputTokenInfo?.chainId,
        inputTokenInfo?.address,
        inputTokenInfo?.decimals,
        inputTokenInfo?.symbol,
        inputTokenInfo?.name,
      );
    } else if (gelatoInputCurrency && gelatoInputCurrency?.isToken) {
      return new Token(
        gelatoInputCurrency?.chainId,
        gelatoInputCurrency?.address,
        gelatoInputCurrency?.decimals,
        gelatoInputCurrency?.symbol,
        gelatoInputCurrency?.name,
      );
    } else {
      return undefined;
    }
  };

  const getOutputCurrency = () => {
    if (gelatoOutputCurrency && gelatoOutputCurrency?.symbol === CAVAX[chainId].symbol) {
      return CAVAX[chainId];
    } else if (outputTokenInfo && outputTokenInfo?.symbol === CAVAX[chainId].symbol) {
      return CAVAX[chainId];
    } else if (outputTokenInfo) {
      return new Token(
        outputTokenInfo?.chainId,
        outputTokenInfo?.address,
        outputTokenInfo?.decimals,
        outputTokenInfo?.symbol,
        outputTokenInfo?.name,
      );
    } else if (gelatoOutputCurrency && gelatoOutputCurrency?.isToken) {
      return new Token(
        gelatoOutputCurrency?.chainId,
        gelatoOutputCurrency?.address,
        gelatoOutputCurrency?.decimals,
        gelatoOutputCurrency?.symbol,
        gelatoOutputCurrency?.name,
      );
    } else {
      return undefined;
    }
  };

  const handleActiveTab = (tab: 'SELL' | 'BUY') => {
    if (activeTab === tab) return;

    handleRateType(rateType, price);
    setActiveTab(tab);
  };

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  const addTransaction = useTransactionAdder();
  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(LimitNewField.INPUT as any, value);
    },
    [onUserInput],
  );

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(LimitNewField.OUTPUT as any, value);
    },
    [onUserInput],
  );

  // price
  const handleTypeDesiredRate = useCallback(
    (value: string) => {
      onUserInput(LimitNewField.PRICE as any, value);
    },
    [onUserInput],
  );

  // setting default tokens
  const defaultInputToken = useToken(defaultInputAddress);
  const defaultInputCurrency = defaultInputToken ? unwrappedToken(defaultInputToken as Token, chainId) : undefined;
  const defaultOutputToken = useToken(defaultOutputAddress);
  const defaultOutputCurrency = defaultOutputToken ? unwrappedToken(defaultOutputToken as Token, chainId) : undefined;

  useEffect(() => {
    if (defaultInputCurrency) {
      onCurrencySelect(defaultInputCurrency, LimitNewField.INPUT);
    }
    if (defaultOutputCurrency) {
      onCurrencySelect(defaultOutputCurrency, LimitNewField.OUTPUT);
    }
  }, [chainId, defaultInputAddress, defaultOutputAddress, defaultInputCurrency, defaultOutputCurrency]);

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean;
    tradeToConfirm: Trade | undefined;
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

  const tradePrice = trade?.executionPrice;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromInputCurrencyAmount(parsedAmounts.input);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const maxAmountInput: CurrencyAmount<UniCurrency> | undefined = galetoMaxAmountSpend(
    chainId,
    currencyBalances[LimitField.INPUT],
  );

  const mixpanel = useMixpanel();

  // for limit swap
  const handleSwap = useCallback(() => {
    if (!handleLimitOrderSubmission) {
      return;
    }

    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    });

    try {
      if (!currencies.input?.wrapped.address) {
        throw new Error('Invalid input currency');
      }

      if (!currencies.output?.wrapped.address) {
        throw new Error('Invalid output currency');
      }

      if (!rawAmounts.input) {
        throw new Error('Invalid input amount');
      }

      if (!rawAmounts.output) {
        throw new Error('Invalid output amount');
      }

      if (!account) {
        throw new Error('No account');
      }

      const orderType = activeTab === 'SELL' ? t('swapPage.sell') : t('swapPage.buy');

      handleLimitOrderSubmission({
        inputToken: currencies.input?.isNative ? NATIVE : currencies.input?.wrapped.address,
        outputToken: currencies.output?.isNative ? NATIVE : currencies.output?.wrapped.address,
        inputAmount: rawAmounts.input,
        outputAmount: rawAmounts.output,
        owner: account,
      })
        .then((response) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: response.hash,
          });
          addTransaction(response, { summary: t('swapPage.orderPlaced', { orderType: capitalizeWord(orderType) }) });
          if (trade) {
            const path = trade.route.path;
            const tokenA = path[0];
            const tokenB = path[path.length - 1];
            mixpanel.track(MixPanelEvents.LIMIT_ORDER, {
              chainId: chainId,
              tokenA: inputCurrency?.symbol,
              tokenB: outputCurrency?.symbol,
              tokenA_Address: tokenA.address,
              tokenB_Address: tokenB.address,
              orderType: activeTab.toLowerCase(),
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
    } catch (error) {
      setSwapState({
        attemptingTxn: false,
        tradeToConfirm,
        showConfirm,
        swapErrorMessage: (error as any).message,
        txHash: undefined,
      });
      // we only care if the error is something _other_ than the user rejected the tx
      if ((error as any)?.code !== 4001) {
        console.error(error);
      }
    }
  }, [
    handleLimitOrderSubmission,
    tradeToConfirm,
    showConfirm,
    currencies.input,
    currencies.output,
    rawAmounts.input,
    rawAmounts.output,
    account,
  ]);

  const handleSelectTokenDrawerClose = useCallback(() => {
    setIsTokenDrawerOpen(false);
  }, [setIsTokenDrawerOpen]);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode

  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED));

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(LimitNewField.INPUT as any, '');
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade as any, swapErrorMessage, txHash, attemptingTxn, showConfirm });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const onCurrencySelect = useCallback(
    (currency: any, tokenDrawerTypeArg?: LimitNewField) => {
      const type = tokenDrawerTypeArg ?? tokenDrawerType;
      if (type === (LimitNewField.INPUT as any)) {
        setApprovalSubmitted(false); // reset 2 step UI for approvals
      }

      // here need to add isToken because in Galato hook require this variable to select currency
      const newCurrency = { ...currency };
      if (currency?.symbol === CAVAX[chainId].symbol) {
        newCurrency.isNative = true;
      } else {
        newCurrency.isToken = true;
      }

      onCurrencySelection(type as any, newCurrency);
      // this is to update tokens on chart on token selection
      onSwapCurrencySelection(type as any, currency);
    },
    [tokenDrawerType, onCurrencySelection, onSwapCurrencySelection],
  );

  const handleApprove = useCallback(async () => {
    await approveCallback();
  }, [approveCallback]);

  const isAEBToken = useIsSelectedAEBToken();

  const handlePlaceOrder = () => {
    setSwapState({
      tradeToConfirm: trade as any,
      attemptingTxn: false,
      swapErrorMessage: undefined,
      showConfirm: true,
      txHash: undefined,
    });
  };

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal}>
          {t('swapPage.connectWallet')}
        </Button>
      );
    }

    if (showApproveFlow) {
      return (
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box mr="10px" width="100%">
            <Button
              variant={approval === ApprovalState.APPROVED ? 'confirm' : 'primary'}
              onClick={handleApprove}
              isDisabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
              loading={approval === ApprovalState.PENDING}
              loadingText={t('swapPage.approving')}
            >
              {approvalSubmitted && approval === ApprovalState.APPROVED
                ? t('swapPage.approved')
                : `${t('swapPage.approve')} ` + currencies[LimitField.INPUT]?.symbol}
            </Button>
          </Box>

          <Button
            variant="primary"
            onClick={() => handlePlaceOrder()}
            id="swap-button"
            isDisabled={!isValid || approval !== ApprovalState.APPROVED}
            //error={isValid}
          >
            {t('swapPage.placeOrder')}
          </Button>
        </Box>
      );
    }

    return (
      <Button
        variant="primary"
        onClick={() => handlePlaceOrder()}
        id="swap-button"
        isDisabled={!isValid || !!swapInputError}
        backgroundColor={isValid ? 'primary' : undefined}
      >
        {swapInputError ? swapInputError : t('swapPage.placeOrder')}
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
                const multipyAmount = JSBI.multiply(maxAmountInput?.numerator, JSBI.BigInt(value)); //Currency from uniswap sdk-core not contain raw function
                const divideAmount = JSBI.divide(multipyAmount, JSBI.BigInt(100));
                const token = wrappedGelatoCurrency(maxAmountInput?.currency ?? undefined, chainId) as Token;
                const newFinalAmount = new TokenAmount(token, divideAmount);

                onUserInput(LimitNewField.INPUT as any, newFinalAmount.toExact());
              }
            }}
          >
            {value}%
          </PValue>
        ))}
      </Box>
    );
  };

  const inputCurrency = getInputCurrency();
  const outputCurrency = getOutputCurrency();

  return (
    <Root>
      <TradeOption
        isTWAPOrderVisible={isTWAPOrderVisible}
        swapType={swapType}
        setSwapType={setSwapType}
        isLimitOrderVisible={isLimitOrderVisible}
      />

      <SwapWrapper>
        <Box width="100%" display="flex" justifyContent="center">
          <Box textAlign="center" width="120px">
            <ToggleButtons
              options={['SELL', 'BUY']}
              value={activeTab}
              onChange={(value) => {
                handleActiveTab(value);
              }}
            />
          </Box>
        </Box>

        <Box p={10}>
          {isAEBToken && <DeprecatedWarning />}

          <CurrencyInputTextBox
            label={
              independentField === (LimitNewField.OUTPUT as any) && trade
                ? t('swapPage.fromEstimated')
                : t('swapPage.from')
            }
            value={formattedAmounts[LimitField.INPUT]}
            onChange={(value: any) => {
              setSelectedPercentage(0);
              handleTypeInput(value as any);
            }}
            onTokenClick={() => {
              setTokenDrawerType(LimitNewField.INPUT as any);
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
            <ArrowWrapper>
              {rateType === Rate.MUL ? (
                <X size="16" color={theme.swapWidget?.interactiveColor} />
              ) : (
                <Divide size="16" color={theme.swapWidget?.interactiveColor} />
              )}
            </ArrowWrapper>
          </Box>

          <Box>
            <InputText
              value={formattedAmounts[LimitField.PRICE]}
              onChange={(value: any) => handleTypeDesiredRate(value as any)}
              fontSize={24}
              isNumeric={true}
              placeholder="0.00"
              label={t('swapPage.price')}
            />
          </Box>
          <Box width="100%" textAlign="center" alignItems="center" display="flex" justifyContent={'center'} mt={10}>
            <ArrowWrapper
              onClick={() => {
                setApprovalSubmitted(false); // reset 2 step UI for approvals
                onSwitchTokens();
              }}
            >
              <RefreshCcw size="16" color={theme.swapWidget?.interactiveColor} />
            </ArrowWrapper>
          </Box>
          <CurrencyInputTextBox
            label={
              independentField === (LimitNewField.INPUT as any) && trade ? t('swapPage.toEstimated') : t('swapPage.to')
            }
            value={formattedAmounts[LimitField.OUTPUT]}
            onChange={(value: any) => {
              setSelectedPercentage(0);
              handleTypeOutput(value as any);
            }}
            onTokenClick={() => {
              setTokenDrawerType(LimitNewField.OUTPUT as any);
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
                  {t('swapPage.price')}: {tradePrice?.toSignificant(6)} {tradePrice?.quoteCurrency?.symbol}
                </Text>
              )
            }
          />

          {trade && <LimitOrderDetailInfo trade={trade} />}

          <Box width="100%" mt={10}>
            {renderButton()}
          </Box>
        </Box>
      </SwapWrapper>

      {isTokenDrawerOpen && (
        <SelectTokenDrawer
          isOpen={isTokenDrawerOpen}
          onClose={handleSelectTokenDrawerClose}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={tokenDrawerType === (LimitNewField.INPUT as any) ? inputCurrency : outputCurrency}
          otherSelectedCurrency={tokenDrawerType === (LimitNewField.INPUT as any) ? outputCurrency : inputCurrency}
        />
      )}

      {/* Confirm Swap Drawer */}
      {trade && (
        <ConfirmLimitOrderDrawer
          isOpen={showConfirm}
          trade={trade as any}
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
export default LimitOrder;
/* eslint-enable max-lines */
