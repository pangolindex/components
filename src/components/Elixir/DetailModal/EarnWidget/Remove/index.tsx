import { Percent } from '@pangolindex/sdk';
import mixpanel from 'mixpanel-browser';
import React, { useContext, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, NumberOptions, Text, TextInput, TransactionCompleted } from 'src/components';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents } from 'src/hooks/mixpanel';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { useElixirRemoveLiquidityHook } from 'src/state/pburn/elixir';
import { useDerivedBurnInfo } from 'src/state/pburn/elixir/common';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { BlackWrapper, ButtonWrapper, ErrorBox, ErrorWrapper, RemoveWrapper } from './styles';
import { RemoveProps } from './types';

const Remove = ({ position }: RemoveProps) => {
  const chainId = useChainId();
  const { account } = usePangolinWeb3();
  const { provider, library } = useLibrary();
  const toggleWalletModal = useWalletModalToggle();
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
  }
  const { t } = useTranslation();
  const [percentage, setPercentage] = useState<number>(4);
  const theme = useContext(ThemeContext);

  const {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
  } = useDerivedBurnInfo(position, percentage);

  const [userSlippage] = useUserSlippageTolerance();
  const deadline = useTransactionDeadline();
  const removeLiquidity = useElixirRemoveLiquidityHook[chainId]();

  const onBurn = async () => {
    if (!chainId || !library || !account || !provider) return;
    if (
      !liquidityValue0 ||
      !liquidityValue1 ||
      !position?.tokenId ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage
    ) {
      return;
    }

    try {
      setAttempting(true);

      const removeLiqResponse = await removeLiquidity({
        tokenId: position?.tokenId,
        positionSDK,
        liquidityPercentage,
        liquidities: {
          liquidityValue0,
          liquidityValue1,
        },
        feeValues: {
          feeValue0,
          feeValue1,
        },
        allowedSlippage: new Percent(userSlippage, 10_000),
        deadline,
      });

      setHash(removeLiqResponse?.hash as string);

      if (removeLiqResponse?.hash) {
        mixpanel.track(MixPanelEvents.REMOVE_LIQUIDITY, {
          chainId: chainId,
          token0: liquidityValue0?.currency?.symbol,
          token1: liquidityValue1?.currency?.symbol,
          tokenId: position?.tokenId,
        });
      }
    } catch (err) {
      const _err = typeof err === 'string' ? new Error(err) : (err as any);
      setError(_err?.message);
      console.error(_err);
    } finally {
      setAttempting(false);
    }
  };

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal} height="46px">
          {t('common.connectWallet')}
        </Button>
      );
    }

    return (
      <ButtonWrapper>
        <Box width="100%">
          <Button
            variant="primary"
            loading={attempting && !hash}
            loadingText={t('common.loading')}
            height="46px"
            onClick={onBurn}
            isDisabled={percentage === 0}
          >
            {t('common.remove')}
          </Button>
        </Box>
      </ButtonWrapper>
    );
  };

  return (
    <RemoveWrapper>
      {!attempting && !hash && !error && (
        <>
          <Box flex={1}>
            <Box>
              <Box display="flex" flexDirection="column" style={{ gap: '12px' }}>
                <TextInput
                  addonAfter={
                    <Box display="flex" alignItems="center">
                      <Text color="text4" fontSize={[24, 18]}>
                        {liquidityValue0?.currency?.symbol}
                      </Text>
                    </Box>
                  }
                  disabled
                  value={liquidityValue0 ? parseFloat(liquidityValue0.toSignificant(6)) / 100 : '-'} // We divide by 100 to get the correct value, because of the percentage
                  fontSize={24}
                  isNumeric={true}
                  placeholder="0.00"
                />
                <TextInput
                  addonAfter={
                    <Box display="flex" alignItems="center">
                      <Text color="text4" fontSize={[24, 18]}>
                        {liquidityValue1?.currency?.symbol}
                      </Text>
                    </Box>
                  }
                  value={liquidityValue1 ? parseFloat(liquidityValue1.toSignificant(6)) / 100 : '-'} // We divide by 100 to get the correct value, because of the percentage
                  disabled
                  fontSize={24}
                  isNumeric={true}
                  placeholder="0.00"
                />

                <Box my="5px">
                  <NumberOptions
                    onChange={(value) => {
                      setPercentage(value);
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

      {error && (
        <BlackWrapper>
          <ErrorWrapper>
            <ErrorBox>
              <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
              <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="center" style={{ width: '85%' }}>
                {error}
              </Text>
            </ErrorBox>
            <Button variant="primary" onClick={wrappedOnDismiss}>
              {t('transactionConfirmation.dismiss')}
            </Button>
          </ErrorWrapper>
        </BlackWrapper>
      )}

      {attempting && !hash && !error && (
        <BlackWrapper>
          <Loader size={100} label={`${t('common.removingLiquidity')}...`} />
        </BlackWrapper>
      )}

      {hash && (
        <BlackWrapper>
          <TransactionCompleted
            rootStyle={{ width: '100%' }}
            buttonText={t('common.close')}
            submitText={t('common.removedLiquidity')}
            isShowButtton={true}
            onButtonClick={wrappedOnDismiss}
          />
        </BlackWrapper>
      )}
    </RemoveWrapper>
  );
};

export default Remove;
