/* eslint-disable max-lines */
import { Currency, Pair, Percent } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, NumberOptions, Text, TextInput, TransactionCompleted } from 'src/components';
import { ROUTER_ADDRESS } from 'src/constants';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { useApproveCallbackHook } from 'src/hooks/multiChainsHooks';
import { ApprovalState } from 'src/hooks/useApproveCallback';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Field } from 'src/state/pburn/actions';
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from 'src/state/pburn/hooks';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { useRemoveLiquidityHook } from 'src/state/pwallet/multiChainsHooks';
import { isEvmChain } from 'src/utils';
import { ButtonWrapper, RemoveWrapper } from './styleds';

interface RemoveLiquidityProps {
  currencyA?: Currency;
  currencyB?: Currency;
  // this prop will be used if user move away from first step
  onLoadingOrComplete?: (value: boolean) => void;
}

const RemoveLiquidity = ({ currencyA, currencyB, onLoadingOrComplete }: RemoveLiquidityProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();

  const useApproveCallback = useApproveCallbackHook[chainId];
  const useRemoveLiquidity = useRemoveLiquidityHook[chainId];
  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  const { independentField, typedValue } = useBurnState();
  const { pair, parsedAmounts, error, userLiquidity } = useDerivedBurnInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
  );

  const { removeLiquidity, onAttemptToApprove, signatureData, setSignatureData } = useRemoveLiquidity(pair as Pair);
  const { onUserInput: _onUserInput } = useBurnActionHandlers();
  const isValid = !error;

  // state for pending and submitted txn views
  const [attempting, setAttempting] = useState<boolean>(false);
  const [hash, setHash] = useState<string | undefined>();
  const deadline = useTransactionDeadline();
  const [allowedSlippage] = useUserSlippageTolerance();

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toExact() ?? '',
  };

  // allowance handling
  // const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
  //   null,
  // );
  const [approval, approveCallback] = useApproveCallback(
    chainId,
    parsedAmounts[Field.LIQUIDITY],
    ROUTER_ADDRESS[chainId],
  );
  const { t } = useTranslation();
  const [percetage, setPercetage] = useState(100);

  useEffect(() => {
    _onUserInput(Field.LIQUIDITY_PERCENT, `100`);
  }, [_onUserInput]);

  useEffect(() => {
    if (onLoadingOrComplete) {
      if (hash || attempting) {
        onLoadingOrComplete(true);
      } else {
        onLoadingOrComplete(false);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, attempting]);

  const onChangePercentage = (value: number) => {
    _onUserInput(Field.LIQUIDITY_PERCENT, `${value}`);
  };

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (_typedValue: string) => {
      setSignatureData(null);
      _onUserInput(Field.LIQUIDITY, _typedValue);
      setPercetage(0);
    },
    [_onUserInput],
  );

  useEffect(() => {
    setPercetage(Number(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)) / 25);
  }, [parsedAmounts]);

  async function onRemove() {
    if (!chainId || !library || !account || !deadline) throw new Error(t('error.missingDependencies'));

    try {
      setAttempting(true);
      const removeData = {
        parsedAmounts,
        deadline,
        allowedSlippage,
        approval,
      };

      const response = await removeLiquidity(removeData);

      setHash(response?.hash);
    } catch (err) {
      const _err = err as any;

      console.error(_err);
    } finally {
      setAttempting(false);
    }
  }

  function getApproveButtonVariant() {
    if (approval === ApprovalState.APPROVED || signatureData !== null) {
      return 'confirm';
    }
    return 'primary';
  }

  function getApproveButtonText() {
    if (approval === ApprovalState.PENDING) {
      return t('removeLiquidity.approving');
    } else if (approval === ApprovalState.APPROVED || signatureData !== null) {
      return t('removeLiquidity.approved');
    }
    return t('removeLiquidity.approve');
  }

  return (
    <RemoveWrapper>
      {!attempting && !hash && (
        <>
          <Box flex={1}>
            <Box>
              <Box display="flex" flexDirection="column">
                <TextInput
                  value={formattedAmounts[Field.LIQUIDITY]}
                  addonAfter={
                    <Box display="flex" alignItems="center">
                      <Text color="text4" fontSize={[24, 18]}>
                        PGL
                      </Text>
                    </Box>
                  }
                  onChange={(value: any) => {
                    onUserInput(value);
                  }}
                  fontSize={24}
                  isNumeric={true}
                  placeholder="0.00"
                  addonLabel={
                    account && (
                      <Text color="text2" fontWeight={500} fontSize={14}>
                        {!!userLiquidity ? t('currencyInputPanel.balance') + userLiquidity?.toSignificant(6) : ' -'}
                      </Text>
                    )
                  }
                />

                <Box my="5px">
                  <NumberOptions
                    onChange={(value) => {
                      setPercetage(value);
                      onChangePercentage(value * 25);
                    }}
                    currentValue={percetage}
                    variant="step"
                    isPercentage={true}
                  />
                </Box>
              </Box>
            </Box>

            {/* <Box>
              <ContentBox>
                <Stat
                  title={tokenA?.symbol}
                  stat={`${formattedAmounts[Field.CURRENCY_A] || '-'}`}
                  titlePosition="top"
                  titleFontSize={14}
                  statFontSize={16}
                  titleColor="text4"
                  statAlign="center"
                />

                <Stat
                  title={tokenB?.symbol}
                  stat={`${formattedAmounts[Field.CURRENCY_B] || '-'}`}
                  titlePosition="top"
                  titleFontSize={14}
                  statFontSize={16}
                  titleColor="text4"
                  statAlign="center"
                />
              </ContentBox>
            </Box> */}
          </Box>
          <Box mt={0}>
            {!account ? (
              <Button variant="primary" onClick={toggleWalletModal} height="46px">
                {t('earn.deposit')}
              </Button>
            ) : (
              <ButtonWrapper>
                {isEvmChain(chainId) && (
                  <Box mr="5px" width="100%">
                    <Button
                      variant={getApproveButtonVariant()}
                      onClick={() => {
                        onAttemptToApprove({ parsedAmounts, deadline, approveCallback });
                      }}
                      isDisabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                      loading={attempting && !hash}
                      loadingText={t('removeLiquidity.approving')}
                      height="46px"
                    >
                      {getApproveButtonText()}
                    </Button>
                  </Box>
                )}

                <Box width="100%">
                  <Button
                    variant="primary"
                    isDisabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                    onClick={onRemove}
                    loading={attempting && !hash}
                    loadingText={t('migratePage.loading')}
                    height="46px"
                  >
                    {error || t('removeLiquidity.remove')}
                  </Button>
                </Box>
              </ButtonWrapper>
            )}
          </Box>
        </>
      )}

      {attempting && !hash && <Loader size={100} label={`Removing Liquidity...`} />}
      {hash && <TransactionCompleted submitText={`Removed Liquidity`} />}
    </RemoveWrapper>
  );
};
export default RemoveLiquidity;
/* eslint-enable max-lines */
