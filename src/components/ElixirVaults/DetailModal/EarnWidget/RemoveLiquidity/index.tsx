/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, NumberOptions, Text, TextInput, TransactionCompleted } from 'src/components';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { useVaultActionHandlers } from 'src/state/pelixirVaults/hooks';
import { ElixirVault } from 'src/state/pelixirVaults/types';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import { ButtonWrapper, RemoveWrapper } from './styleds';

interface RemoveLiquidityProps {
  vault: ElixirVault;
  userLiquidityUnstaked: string;
  onLoading?: (value: boolean) => void;
  onComplete?: (percentage: number) => void;
}

const RemoveLiquidity = ({ vault, userLiquidityUnstaked, onLoading, onComplete }: RemoveLiquidityProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const tokenA = vault?.poolTokens[0];
  const tokenB = vault?.poolTokens[1];
  // const useApproveCallback = useApproveCallbackHook[chainId];
  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  const wrappedCurrencyA = wrappedCurrency(tokenA, chainId);
  const wrappedCurrencyB = wrappedCurrency(tokenB, chainId);

  const [attempting, setAttempting] = useState<boolean>(false);
  const [hash, setHash] = useState<string | undefined>();
  const deadline = useTransactionDeadline();
  // const [allowedSlippage] = useUserSlippageTolerance();
  const userLiquidity = parseFloat(userLiquidityUnstaked);

  //TODO: Remove static data
  const error = null;
  const isValid = true;

  const { t } = useTranslation();
  const [percentage, setPercentage] = useState(100);
  const [amount, setAmount] = useState(userLiquidity);
  const mixpanel = useMixpanel();
  const { removeLiquidity } = useVaultActionHandlers();

  useEffect(() => {
    if (onLoading) {
      onLoading(attempting);
    }
  }, [attempting]);

  const onChangeAmount = useCallback(
    (value: number) => {
      if (value > userLiquidity) {
        value = userLiquidity;
      }
      setAmount(value);

      const rawPercentage = (Number(value) / userLiquidity) * 100;
      let _percentage;
      if (rawPercentage === 0) {
        _percentage = 0;
      } else if (rawPercentage > 0 && rawPercentage <= 25) {
        _percentage = 1;
      } else if (rawPercentage > 25 && rawPercentage <= 50) {
        _percentage = 2;
      } else if (rawPercentage > 50 && rawPercentage <= 99) {
        _percentage = 3;
      } else {
        _percentage = 4;
      }

      setPercentage(_percentage);
    },
    [setAmount, setPercentage],
  );

  const onChangePercentage = useCallback(
    (value: number) => {
      const percentageLookup = [0, 25, 50, 75, 100];
      setPercentage(value);
      const _value = (percentageLookup[value] * userLiquidity) / 100;
      setAmount(_value);
    },
    [setAmount, setPercentage],
  );

  const resetFields = useCallback(() => {
    setAmount(0);
    setPercentage(0);
  }, [setAmount, setPercentage]);

  async function onRemove() {
    if (!chainId || !library || !account || !deadline) throw new Error(t('error.missingDependencies'));

    try {
      setAttempting(true);
      const removeData = {
        account,
        shares: 2,
        vault,
      };

      const response: any = await removeLiquidity(removeData, vault?.strategyProvider[0]); //TODO: Change type

      setHash(response?.hash);

      if (onComplete) {
        onComplete(percentage);
      }

      mixpanel.track(MixPanelEvents.REMOVE_LIQUIDITY, {
        chainId: chainId,
        tokenA: tokenA?.symbol,
        tokenB: tokenB?.symbol,
        tokenA_Address: wrappedCurrencyA?.address,
        tokenB_Address: wrappedCurrencyB?.address,
      });
      resetFields();
    } catch (err) {
      const _err = err as any;

      console.error(_err);
    } finally {
      setAttempting(false);
    }
  }

  //TODO:
  // function getApproveButtonVariant() {
  //   if (approval === ApprovalState.APPROVED) {
  //     return 'confirm';
  //   }
  //   return 'primary';
  // }

  // function getApproveButtonText() {
  //   if (approval === ApprovalState.PENDING) {
  //     return t('removeLiquidity.approving');
  //   } else if (approval === ApprovalState.APPROVED) {
  //     return t('removeLiquidity.approved');
  //   }
  //   return t('removeLiquidity.approve');
  // }

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
  }

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal} height="46px">
          {t('removeLiquidity.connectWallet')}
        </Button>
      );
    }

    // TODO: Probably provider will handle this if not we need to approve reward token
    // if (notAssociateTokens?.length > 0) {
    //   return (
    //     <Button variant="primary" isDisabled={Boolean(isLoadingAssociate)} onClick={onAssociate}>
    //       {isLoadingAssociate
    //         ? `${t('pool.associating')}`
    //         : `${t('pool.associate')} ` + notAssociateTokens?.[0]?.symbol}
    //     </Button>
    //   );
    // } else {
    return (
      <ButtonWrapper>
        {/* <Box mr="5px" width="100%">
          <Button
            variant={getApproveButtonVariant()}
            onClick={() => {
              onAttemptToApprove({ parsedAmounts, deadline, approveCallback });
            }}
            isDisabled={approval !== ApprovalState.NOT_APPROVED}
            loading={attempting && !hash}
            loadingText={t('removeLiquidity.approving')}
            height="46px"
          >
            {getApproveButtonText()}
          </Button>
        </Box> */}

        <Box width="100%">
          <Button
            variant="primary"
            isDisabled={!isValid}
            onClick={onRemove}
            loading={attempting && !hash}
            loadingText={t('migratePage.loading')}
            height="46px"
          >
            {error || t('removeLiquidity.remove')}
          </Button>
        </Box>
      </ButtonWrapper>
    );
    // }
  };

  return (
    <RemoveWrapper>
      {!attempting && !hash && (
        <>
          <Box flex={1}>
            <Box>
              <Box display="flex" flexDirection="column">
                <TextInput
                  value={amount}
                  addonAfter={
                    <Box display="flex" alignItems="center">
                      <Text color="text4" fontSize={[24, 18]}>
                        {tokenA?.symbol + '+' + tokenB?.symbol}
                      </Text>
                    </Box>
                  }
                  onChange={(value: any) => {
                    onChangeAmount(value);
                  }}
                  fontSize={24}
                  isNumeric={true}
                  placeholder="0.00"
                  addonLabel={
                    account && (
                      <Text color="text2" fontWeight={500} fontSize={14}>
                        {!!userLiquidity
                          ? t('currencyInputPanel.balance') + userLiquidity // userLiquidity?.toFixed(Math.min(2, userLiquidity.token.decimals)) //TODO:
                          : '-'}
                      </Text>
                    )
                  }
                />

                <Box my="5px">
                  <NumberOptions
                    onChange={(value) => {
                      onChangePercentage(value);
                    }}
                    currentValue={percentage}
                    variant="step"
                    isPercentage={true}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <Box mt={0}>{renderButton()}</Box>
        </>
      )}

      {attempting && !hash && <Loader size={100} label={`${t('removeLiquidity.removingLiquidity')}...`} />}
      {hash && (
        <TransactionCompleted
          onButtonClick={wrappedOnDismiss}
          buttonText={t('transactionConfirmation.close')}
          submitText={t('removeLiquidity.removedLiquidity')}
          isShowButtton={true}
        />
      )}
    </RemoveWrapper>
  );
};
export default RemoveLiquidity;
/* eslint-enable max-lines */
