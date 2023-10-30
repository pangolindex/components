/* eslint-disable max-lines */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, NumberOptions, Text, TextInput } from 'src/components';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { useElixirVaultActionHandlers, useVaultActionHandlers } from 'src/state/pelixirVaults/hooks';
import { ElixirVault, RemoveElixirVaultLiquidityProps } from 'src/state/pelixirVaults/types';
import { getEtherscanLink } from 'src/utils';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import { BlackWrapper, ButtonWrapper, ErrorBox, Link, RemoveWrapper } from './styleds';

interface RemoveLiquidityProps {
  vault: ElixirVault;
  userVaultLiquidity: string;
  onLoading?: (value: boolean) => void;
  onComplete?: (percentage: number) => void;
}

const RemoveLiquidity = ({ vault, userVaultLiquidity, onLoading, onComplete }: RemoveLiquidityProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const tokenA = vault?.poolTokens[0];
  const tokenB = vault?.poolTokens[1];
  const toggleWalletModal = useWalletModalToggle();

  const wrappedCurrencyA = wrappedCurrency(tokenA, chainId);
  const wrappedCurrencyB = wrappedCurrency(tokenB, chainId);

  const [attempting, setAttempting] = useState<boolean>(false);
  const [hash, setHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
    onClearTransactionData();
  }

  const userLiquidity = parseFloat(userVaultLiquidity);

  const { t } = useTranslation();
  const [percentage, setPercentage] = useState(100);
  const theme = useContext(ThemeContext);
  const [amount, setAmount] = useState(userLiquidity);
  const mixpanel = useMixpanel();
  const { removeLiquidity } = useVaultActionHandlers();
  const { onClearTransactionData } = useElixirVaultActionHandlers();

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
    if (!chainId || !library || !account) return;

    try {
      setAttempting(true);

      const percentageLookup = [0, 0.25, 0.5, 0.75, 1];
      const ratio = percentageLookup[percentage];

      const shares = ratio * userLiquidity;
      const removeData: RemoveElixirVaultLiquidityProps = {
        account,
        shares: shares,
        vault,
        library,
      };
      const response: any = await removeLiquidity(removeData, vault?.strategyProvider[0]);

      if (response?.status === 'rejected') {
        setError(response?.reason?.message);
        return;
      } else if (response?.status === 'fulfilled') {
        setHash(response?.value?.hash as string);
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
      }

      resetFields();
    } catch (err) {
      const _err = typeof err === 'string' ? new Error(err) : (err as any);
      setError(_err?.message);
    } finally {
      setAttempting(false);
    }
  }

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal} height="46px">
          {t('removeLiquidity.connectWallet')}
        </Button>
      );
    }

    return (
      <ButtonWrapper>
        <Box width="100%">
          <Button
            isDisabled={percentage === 0}
            variant="primary"
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
                  value={amount?.toFixed(8)}
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
                        {!!userLiquidity ? t('currencyInputPanel.balance') + userLiquidity?.toFixed(8) : '-'}
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
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" paddingY={'20px'}>
          <Box flex="1" display="flex" alignItems="center">
            <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary} />
          </Box>
          <Text color="swapWidget.primary" fontWeight={500} fontSize={20}>
            {t('earn.transactionSubmitted')}
          </Text>
          {chainId && hash && (
            <Link
              as="a"
              fontWeight={500}
              fontSize={14}
              color={'primary'}
              href={getEtherscanLink(chainId, hash, 'transaction')}
              target="_blank"
            >
              {t('transactionConfirmation.viewExplorer')}
            </Link>
          )}
        </Box>
      )}

      {error && (
        <BlackWrapper>
          <ErrorBox>
            <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="center" style={{ width: '85%' }}>
              {error.substring(0, 200)}
            </Text>
          </ErrorBox>
          <ButtonWrapper>
            <Button height="46px" variant="primary" borderRadius="4px" onClick={wrappedOnDismiss}>
              {t('transactionConfirmation.dismiss')}
            </Button>
          </ButtonWrapper>
        </BlackWrapper>
      )}
    </RemoveWrapper>
  );
};
export default RemoveLiquidity;
/* eslint-enable max-lines */
