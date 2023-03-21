/* eslint-disable max-lines */
import { Currency, Pair, TokenAmount } from '@pangolindex/sdk';
import React, { useCallback, useContext, useState } from 'react';
import { Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Text, TextInput } from 'src/components';
import { ROUTER_ADDRESS } from 'src/constants/address';
import { PairState } from 'src/data/Reserves';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Field, useMintStateAtom } from 'src/state/pmint/atom';
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'src/state/pmint/hooks';
import { SpaceType } from 'src/state/pstake/types';
import { useIsExpertMode, useUserSlippageTolerance } from 'src/state/puser/hooks';
import { useAddLiquidityHook } from 'src/state/pwallet/hooks';
import { useCurrencyBalance } from 'src/state/pwallet/hooks/common';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import ConfirmPoolDrawer from './ConfirmPoolDrawer';
import PoolPriceBar from './PoolPriceBar';
import { AddWrapper, ArrowWrapper, ButtonWrapper, Buttons, InputWrapper, LightCard, StyledBalanceMax } from './styleds';

interface AddLiquidityProps {
  currencyA: Currency;
  currencyB: Currency;
  onComplete?: () => void;
  onAddToFarm?: () => void;
  type: SpaceType.card | SpaceType.detail;
}

const AddLiquidity = ({ currencyA, currencyB, onComplete, onAddToFarm, type }: AddLiquidityProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const { resetMintState } = useMintStateAtom();
  const expertMode = useIsExpertMode();

  const wrappedCurrencyA = wrappedCurrency(currencyA, chainId);
  const wrappedCurrencyB = wrappedCurrency(currencyB, chainId);

  const pairAddress = wrappedCurrencyA && wrappedCurrencyB ? Pair.getAddress(wrappedCurrencyA, wrappedCurrencyB) : '';

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState(pairAddress);
  const {
    dependentField,
    currencies,
    // pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined);
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const addLiquidity = useAddLiquidityHook[chainId]();
  const useApproveCallback = useApproveCallbackHook[chainId];

  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const deadline = useTransactionDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>('');

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(chainId, currencyBalances[field]),
      };
    },
    {},
  );

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      };
    },
    {},
  );

  const mixpanel = useMixpanel();

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    chainId,
    parsedAmounts[Field.CURRENCY_A],
    ROUTER_ADDRESS[chainId],
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    chainId,
    parsedAmounts[Field.CURRENCY_B],
    ROUTER_ADDRESS[chainId],
  );

  async function onAdd() {
    if (!chainId || !library || !account) return;

    try {
      setAttemptingTxn(true);
      const addData = {
        parsedAmounts,
        deadline,
        noLiquidity,
        allowedSlippage,
        currencies,
      };

      const response = await addLiquidity(addData);

      setTxHash(response?.hash as string);

      mixpanel.track(MixPanelEvents.ADD_LIQUIDITY, {
        chainId: chainId,
        tokenA: currencyA?.symbol,
        tokenB: currencyB?.symbol,
        tokenA_Address: wrappedCurrency(currencyA, chainId)?.address,
        tokenB_Address: wrappedCurrency(currencyB, chainId)?.address,
      });
      resetMintState({ pairAddress });
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
    if (txHash) {
      onFieldAInput('', pairAddress);
    }
    setTxHash('');
    setAttemptingTxn(false);
  }, [onFieldAInput, txHash]);

  const handleTypeInput = useCallback(
    (value: string) => {
      onFieldAInput(value, pairAddress);
    },
    [onFieldAInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onFieldBInput(value, pairAddress);
    },
    [onFieldBInput],
  );

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  const selectedCurrencyBalanceA = useCurrencyBalance(chainId, account ?? undefined, currencyA ?? undefined);
  const selectedCurrencyBalanceB = useCurrencyBalance(chainId, account ?? undefined, currencyB ?? undefined);

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
            isDisabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
            //error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
          >
            {error ?? t('addLiquidity.supply')}
          </Button>
        </Buttons>
      );
    }
  };

  return (
    <AddWrapper>
      <Box flex={1}>
        <InputWrapper type={type}>
          <TextInput
            value={formattedAmounts[Field.CURRENCY_A]}
            addonAfter={
              !atMaxAmounts[Field.CURRENCY_A] ? (
                <Box display={'flex'} alignItems={'center'} height={'100%'} justifyContent={'center'}>
                  <StyledBalanceMax
                    onClick={() => onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '', pairAddress)}
                  >
                    {t('currencyInputPanel.max')}
                  </StyledBalanceMax>
                </Box>
              ) : (
                ''
              )
            }
            onChange={(value: any) => {
              handleTypeInput(value);
            }}
            label={`${currencyA?.symbol}`}
            fontSize={16}
            isNumeric={true}
            placeholder="0.00"
            addonLabel={
              account && (
                <Text color="text2" fontWeight={500} fontSize={12}>
                  {!!currencyA && selectedCurrencyBalanceA ? selectedCurrencyBalanceA?.toSignificant(4) : ' -'}
                </Text>
              )
            }
          />

          <Box
            width="100%"
            textAlign="center"
            alignItems="center"
            display={type === 'card' ? 'none' : 'flex'}
            justifyContent={'center'}
            mt={10}
          >
            <ArrowWrapper>
              <Plus size="16" color={theme.text1} />
            </ArrowWrapper>
          </Box>

          <TextInput
            value={formattedAmounts[Field.CURRENCY_B]}
            addonAfter={
              !atMaxAmounts[Field.CURRENCY_B] ? (
                <Box display={'flex'} alignItems={'center'} height={'100%'} justifyContent={'center'}>
                  <StyledBalanceMax
                    onClick={() => onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '', pairAddress)}
                  >
                    {t('currencyInputPanel.max')}
                  </StyledBalanceMax>
                </Box>
              ) : (
                ''
              )
            }
            onChange={(value: any) => {
              handleTypeOutput(value);
            }}
            label={`${currencyB?.symbol}`}
            fontSize={16}
            isNumeric={true}
            placeholder="0.00"
            addonLabel={
              account && (
                <Text color="text2" fontWeight={500} fontSize={12}>
                  {!!currencyB && selectedCurrencyBalanceB ? selectedCurrencyBalanceB?.toSignificant(4) : ' -'}
                </Text>
              )
            }
          />
        </InputWrapper>

        {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
          <LightCard padding="0px">
            {/* <Text fontWeight={500} fontSize={14} color="text1">
            {noLiquidity ? t('addLiquidity.initialPrices') : t('addLiquidity.prices')} {t('addLiquidity.poolShare')}
          </Text> */}

            <PoolPriceBar
              currencies={currencies}
              poolTokenPercentage={poolTokenPercentage}
              noLiquidity={noLiquidity}
              price={price}
              parsedAmounts={parsedAmounts}
            />
          </LightCard>
        )}
      </Box>
      <Box width="100%">{renderButton()}</Box>

      {/* Confirm Swap Drawer */}
      {showConfirm && (
        <ConfirmPoolDrawer
          isOpen={showConfirm}
          allowedSlippage={allowedSlippage}
          poolErrorMessage={error}
          price={price}
          currencies={currencies}
          parsedAmounts={parsedAmounts}
          noLiquidity={noLiquidity}
          liquidityMinted={liquidityMinted}
          onAdd={onAdd}
          poolTokenPercentage={poolTokenPercentage}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          onClose={handleDismissConfirmation}
          onComplete={onComplete}
          onAddToFarm={onAddToFarm}
          type={type}
        />
      )}
    </AddWrapper>
  );
};
export default AddLiquidity;
/* eslint-enable max-lines */
