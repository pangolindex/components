/* eslint-disable max-lines */
import { CHAINS, Currency, FeeAmount } from '@pangolindex/sdk';
import React, { useCallback, useContext, useState } from 'react';
import { Info, Lock } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { ThemeContext } from 'styled-components';
import { Box, Button, Modal, Text, Tooltip } from 'src/components';
import LiquidityChartRangeInput from 'src/components/LiquidityChartRangeInput';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Bound, Field } from 'src/state/pmint/elixir/atom';
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState,
  useRangeHopCallbacks,
} from 'src/state/pmint/elixir/hooks';
import { useIsExpertMode, useUserSlippageTolerance } from 'src/state/puser/hooks';
import { useElixirAddLiquidityHook } from 'src/state/pwallet/elixir/hooks';
import { useDerivedPositionInfo, useElixirPositionFromTokenId } from 'src/state/pwallet/elixir/hooks/evm';
import { useCurrencyBalance } from 'src/state/pwallet/hooks/common';
import { CloseIcon } from 'src/theme/components';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import OutofRangeWarning from '../OutofRangeWarning';
import ConfirmDrawer from './ConfirmDrawer';
import FeeSelector from './FeeSelector';
import PriceRange from './PriceRange';
import SelectPair from './SelectPair';
import {
  ButtonWrapper,
  Buttons,
  CurrencyInputTextBox,
  CurrencyInputs,
  DynamicSection,
  InputText,
  InputValue,
  InputWrapper,
  Root,
  Wrapper,
} from './styles';
import { AddLiquidityProps } from './types';

const AddLiquidity: React.FC<AddLiquidityProps> = (props) => {
  const { t } = useTranslation();
  const { library, provider } = useLibrary();
  const { account } = usePangolinWeb3();
  const { height } = useWindowSize();
  const chainId = useChainId();
  const expertMode = useIsExpertMode();
  const { isOpen, onClose } = props;

  const theme = useContext(ThemeContext);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<Field>(Field.CURRENCY_A);

  // mint state
  const { independentField, typedValue, feeAmount, startPriceTypedValue } = useMintState();

  // TODO check tokenId
  // const tokenId = '';
  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useElixirPositionFromTokenId(undefined);
  const hasExistingPosition = !!existingPositionDetails && !positionLoading;
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails);

  const {
    dependentField,
    noLiquidity,
    currencies,
    price,
    invertPrice,
    ticks,
    pricesAtTicks,
    pool,
    ticksAtLimit,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    parsedAmounts,
    errorMessage,
    position,
  } = useDerivedMintInfo(existingPosition);

  const {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onCurrencySelection,
    onSetFeeAmount,
    onStartPriceInput,
    onResetMintState,
    onSwitchCurrencies,
    onResettMintStateOnToggle,
  } = useMintActionHandlers(noLiquidity);

  const isValid = !errorMessage && !invalidRange;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false);

  // txn values
  const deadline = useTransactionDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>('');
  const mixpanel = useMixpanel();
  const addLiquidity = useElixirAddLiquidityHook[chainId]();
  const useApproveCallback = useApproveCallbackHook[chainId];

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    chainId,
    parsedAmounts[Field.CURRENCY_A],
    CHAINS[chainId]?.contracts?.elixir?.nftManager,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    chainId,
    parsedAmounts[Field.CURRENCY_B],
    CHAINS[chainId]?.contracts?.elixir?.nftManager,
  );

  const currency0 = currencies[Field.CURRENCY_A];
  const currency1 = currencies[Field.CURRENCY_B];

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const onChangeTokenDrawerStatus = useCallback(() => {
    setIsCurrencyDrawerOpen(!isCurrencyDrawerOpen);
  }, [isCurrencyDrawerOpen]);

  const onTokenClick = useCallback(
    (field: Field) => {
      setDrawerType(field);
      onChangeTokenDrawerStatus();
    },
    [setDrawerType, onChangeTokenDrawerStatus],
  );

  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onSetFeeAmount(newFeeAmount);
      onLeftRangeInput('');
      onRightRangeInput('');
    },
    [onSetFeeAmount, onLeftRangeInput, onRightRangeInput],
  );

  const handleToggle = useCallback(() => {
    onSwitchCurrencies();
    onResettMintStateOnToggle();
  }, [onSetFeeAmount, onLeftRangeInput, onRightRangeInput, onSwitchCurrencies]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (drawerType === Field.CURRENCY_A) {
        if (currency1 === currency) {
          onSwitchCurrencies();
        } else {
          onCurrencySelection(Field.CURRENCY_A, currency);
        }
      } else {
        if (currency0 === currency) {
          onSwitchCurrencies();
        } else {
          onCurrencySelection(Field.CURRENCY_B, currency);
        }
      }
    },
    [drawerType, onSwitchCurrencies, currency0, currency1],
  );

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks;
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks;

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } = useRangeHopCallbacks(
    currency0 ?? undefined,
    currency1 ?? undefined,
    feeAmount,
    tickLower,
    tickUpper,
    pool,
  );

  async function onAdd() {
    if (!chainId || !library || !account || !provider) return;

    if (!currency0 || !currency1) {
      return;
    }

    try {
      setAttemptingTxn(true);
      const addData = {
        parsedAmounts,
        deadline,
        noLiquidity,
        allowedSlippage,
        currencies,
        position,
      };

      const response = await addLiquidity(addData);

      setTxHash(response?.hash as string);

      mixpanel.track(MixPanelEvents.ADD_LIQUIDITY, {
        chainId: chainId,
        tokenA: currency0?.symbol,
        tokenB: currency1?.symbol,
        tokenA_Address: wrappedCurrency(currency0, chainId)?.address,
        tokenB_Address: wrappedCurrency(currency1, chainId)?.address,
      });
      onResetMintState();
    } catch (err) {
      const _err = err as any;

      console.error(_err);
    } finally {
      setAttemptingTxn(false);
    }
  }

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    // if (txHash) {
    //   onFieldAInput('', pairAddress);
    // }
    setTxHash('');
    setAttemptingTxn(false);
  }, [txHash]);

  // TODO: add back
  // const handleSetFullRange = useCallback(() => {
  //   getSetFullRange();

  //   const minPrice = pricesAtLimit[Bound.LOWER];
  //   const maxPrice = pricesAtLimit[Bound.UPPER];
  //   if (minPrice) {
  //     onLeftRangeInput(minPrice.toSignificant(5));
  //   }

  //   if (maxPrice) {
  //     onRightRangeInput(maxPrice.toSignificant(5));
  //   }
  // }, [getSetFullRange, pricesAtLimit, onLeftRangeInput, onRightRangeInput]);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  const selectedCurrencyBalanceA = useCurrencyBalance(chainId, account ?? undefined, currency0 ?? undefined);
  const selectedCurrencyBalanceB = useCurrencyBalance(chainId, account ?? undefined, currency1 ?? undefined);

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal} height="46px">
          {t('swapPage.connectWallet')}
        </Button>
      );
    } else {
      return (
        <Buttons>
          {(approvalA === ApprovalState.NOT_APPROVED ||
            approvalA === ApprovalState.PENDING ||
            approvalB === ApprovalState.NOT_APPROVED ||
            approvalB === ApprovalState.PENDING) &&
            isValid && (
              <ButtonWrapper>
                {approvalA !== ApprovalState.APPROVED && (
                  <Button
                    variant="primary"
                    onClick={approveACallback}
                    isDisabled={approvalA === ApprovalState.PENDING}
                    width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                    loading={approvalA === ApprovalState.PENDING}
                    loadingText={`${t('swapPage.approving')} ${currencies[Field.CURRENCY_A]?.symbol}`}
                    height="46px"
                  >
                    {`${t('addLiquidity.approve')} ` + currencies[Field.CURRENCY_A]?.symbol}
                  </Button>
                )}
                {approvalB !== ApprovalState.APPROVED && (
                  <Button
                    variant="primary"
                    onClick={approveBCallback}
                    isDisabled={approvalB === ApprovalState.PENDING}
                    width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                    loading={approvalB === ApprovalState.PENDING}
                    loadingText={`${t('swapPage.approving')} ${currencies[Field.CURRENCY_B]?.symbol}`}
                    height="46px"
                  >
                    {`${t('addLiquidity.approve')} ` + currencies[Field.CURRENCY_B]?.symbol}
                  </Button>
                )}
              </ButtonWrapper>
            )}
          <Button
            height="46px"
            variant="primary"
            onClick={() => {
              expertMode ? onAdd() : setShowConfirm(true);
            }}
            isDisabled={
              !isValid ||
              (approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
              (approvalB !== ApprovalState.APPROVED && !depositBDisabled)
            }

            //isDisabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
            //error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
          >
            {errorMessage ?? t('addLiquidity.supply')}
          </Button>
        </Buttons>
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} overlayBG={theme.modalBG2} closeOnClickOutside={false}>
      <Root>
        <Wrapper maximumHeight={height - 150}>
          <Box p={20}>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
              <Text color="text1" fontSize={[32, 28]} fontWeight={500} mt={10} mb={12}>
                {t('common.addLiquidity')}
              </Text>
              <CloseIcon onClick={onClose} color={theme.text1} />
            </Box>

            {!hasExistingPosition && (
              <>
                <SelectPair
                  onTokenClick={onTokenClick}
                  handleToggle={handleToggle}
                  currency0={currency0}
                  currency1={currency1}
                />

                <Tooltip id="selectFeeTier" effect="solid">
                  {t('elixir.addLiquidity.feeTierTooltipContext')}
                </Tooltip>

                <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
                    {t('elixir.addLiquidity.selectFeeTier')}
                  </Text>
                  <Box>
                    <Info size={16} color={theme.white} data-tip data-for="selectFeeTier" />
                  </Box>
                </Box>

                <FeeSelector
                  handleFeePoolSelect={handleFeePoolSelect}
                  disabled={!currency0 || !currency1}
                  feeAmount={feeAmount}
                  currency0={currency0}
                  currency1={currency1}
                />
              </>
            )}
            <DynamicSection disabled={!feeAmount || invalidPool}>
              {!noLiquidity ? (
                <Box margin={'40px auto 30px auto'}>
                  <LiquidityChartRangeInput
                    currency0={currency0}
                    currency1={currency1}
                    feeAmount={feeAmount}
                    ticksAtLimit={ticksAtLimit}
                    price={price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined}
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                    onLeftRangeInput={onLeftRangeInput}
                    onRightRangeInput={onRightRangeInput}
                    interactive={!hasExistingPosition}
                  />
                </Box>
              ) : (
                <Box>
                  <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
                    {t('elixir.priceRange.startingPriceRange')}
                  </Text>

                  {noLiquidity && (
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      padding="10px"
                      bgColor="color3"
                      borderRadius="8px"
                      margin="auto"
                      flexGrow={1}
                      mb={10}
                    >
                      <Text fontSize={14} textAlign="left" color="text1" lineHeight={'20px'}>
                        {t('elixir.initializedLiquidity')}
                      </Text>
                    </Box>
                  )}

                  <InputWrapper>
                    <InputText
                      value={startPriceTypedValue}
                      onChange={(value: any) => {
                        onStartPriceInput(value);
                      }}
                      fontSize={24}
                      isNumeric={true}
                      placeholder="0.00"
                    />

                    <InputValue>
                      <Text fontSize={14} style={{ fontWeight: 500 }} textAlign="left" color="text1">
                        Current 1 {currency0?.symbol} Price:
                      </Text>

                      {price ? (
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <Text fontSize={14} style={{ fontWeight: 500 }} textAlign="left" color="text1">
                            {invertPrice
                              ? price?.invert()?.toSignificant(24).substring(0, 24)
                              : price?.toSignificant(24).substring(0, 24)}
                          </Text>{' '}
                          <span style={{ marginLeft: '4px' }}>{currency1?.symbol}</span>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </InputValue>
                  </InputWrapper>
                </Box>
              )}
            </DynamicSection>

            <DynamicSection disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}>
              <PriceRange
                priceLower={priceLower}
                priceUpper={priceUpper}
                getDecrementLower={getDecrementLower}
                getIncrementLower={getIncrementLower}
                getDecrementUpper={getDecrementUpper}
                getIncrementUpper={getIncrementUpper}
                onLeftRangeInput={onLeftRangeInput}
                onRightRangeInput={onRightRangeInput}
                currencyA={currency0}
                currencyB={currency1}
                feeAmount={feeAmount}
                ticksAtLimit={ticksAtLimit}
              />

              {/* TODO: add back */}
              {/* {!noLiquidity && (
                <Box mt={10} mb="5px">
                  <Button variant="outline" onClick={handleSetFullRange} color={theme.text10}>
                    {t('elixir.addLiquidity.fullRange')}
                  </Button>
                </Box>
              )} */}

              {outOfRange ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  padding="10px"
                  bgColor="color3"
                  borderRadius="8px"
                  margin="auto"
                  flexGrow={1}
                  mt={10}
                >
                  <Text fontSize={14} textAlign="left" color="text1">
                    {t('elixir.notEarnFee')}
                  </Text>
                </Box>
              ) : null}
              {invalidRange ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  padding="10px"
                  bgColor="color7"
                  borderRadius="8px"
                  margin="auto"
                  flexGrow={1}
                  mt={10}
                >
                  <Text fontSize={14} textAlign="left" color="text1">
                    {t('elixir.invalidPriceRange')}
                  </Text>
                </Box>
              ) : null}
            </DynamicSection>

            <DynamicSection
              disabled={tickLower === undefined || tickUpper === undefined || invalidPool || invalidRange}
            >
              <CurrencyInputs>
                {depositADisabled ? (
                  <OutofRangeWarning
                    label={`${t('common.from')}`}
                    message={t('elixir.singleAssetDeposit')}
                    addonLabel={<Lock size={18} color={theme?.textInput?.labelText} />}
                  />
                ) : (
                  <CurrencyInputTextBox
                    label={`${t('common.from')}`}
                    value={formattedAmounts[Field.CURRENCY_A]}
                    onChange={(value: any) => {
                      onFieldAInput(value);
                    }}
                    buttonStyle={{
                      cursor: 'default',
                    }}
                    showArrowIcon={false}
                    onTokenClick={() => {}}
                    currency={currency0}
                    fontSize={24}
                    isNumeric={true}
                    placeholder="0.00"
                    id="add-liquidity-currency-input"
                    addonLabel={
                      account && (
                        <Text color="text2" fontWeight={500} fontSize={12}>
                          {!!currency0 && selectedCurrencyBalanceA ? selectedCurrencyBalanceA?.toSignificant(4) : ' -'}
                        </Text>
                      )
                    }
                  />
                )}

                {depositBDisabled ? (
                  <OutofRangeWarning
                    label={`${t('common.to')}`}
                    message={t('elixir.singleAssetDeposit')}
                    addonLabel={<Lock size={18} color={theme?.textInput?.labelText} />}
                  />
                ) : (
                  <CurrencyInputTextBox
                    label={`${t('common.to')}`}
                    value={formattedAmounts[Field.CURRENCY_B]}
                    onChange={(value: any) => {
                      onFieldBInput(value);
                    }}
                    buttonStyle={{
                      cursor: 'default',
                    }}
                    showArrowIcon={false}
                    onTokenClick={() => {}}
                    currency={currency1}
                    fontSize={24}
                    isNumeric={true}
                    placeholder="0.00"
                    id="swap-currency-input"
                    addonLabel={
                      account && (
                        <Text color="text2" fontWeight={500} fontSize={12}>
                          {!!currency1 && selectedCurrencyBalanceB ? selectedCurrencyBalanceB?.toSignificant(4) : ' -'}
                        </Text>
                      )
                    }
                  />
                )}
              </CurrencyInputs>
            </DynamicSection>
            {renderButton()}
          </Box>
        </Wrapper>

        {isCurrencyDrawerOpen && (
          <SelectTokenDrawer
            isOpen={isCurrencyDrawerOpen}
            onClose={onChangeTokenDrawerStatus}
            onCurrencySelect={handleCurrencySelect}
            selectedCurrency={currency0}
            otherSelectedCurrency={currency1}
          />
        )}

        {/* Confirm Swap Drawer */}
        {showConfirm && (
          <ConfirmDrawer
            isOpen={showConfirm}
            poolErrorMessage={errorMessage}
            currencies={currencies}
            noLiquidity={noLiquidity}
            onAdd={onAdd}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            onClose={handleDismissConfirmation}
            position={position}
            ticksAtLimit={ticksAtLimit}
          />
        )}
      </Root>
    </Modal>
  );
};

export default AddLiquidity;
/* eslint-enable max-lines */
