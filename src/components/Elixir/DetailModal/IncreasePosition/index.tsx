/* eslint-disable max-lines */
import mixpanel from 'mixpanel-browser';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Lock } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import shuffle from 'src/assets/images/shuffle.svg';
import { Box, Button, CurrencyInput, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents } from 'src/hooks/mixpanel';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Field } from 'src/state/pmint/elixir/atom';
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'src/state/pmint/elixir/hooks';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { useElixirAddLiquidityHook } from 'src/state/pwallet/elixir/hooks';
import { useDerivedPositionInfo } from 'src/state/pwallet/elixir/hooks/evm';
import { useCurrencyBalance } from 'src/state/pwallet/hooks/common';
import { unwrappedToken, wrappedCurrency } from 'src/utils/wrappedCurrency';
import OutofRangeWarning from '../../OutofRangeWarning';
import {
  AddWrapper,
  ArrowWrapper,
  BlackWrapper,
  ButtonWrapper,
  ErrorBox,
  ErrorWrapper,
  GridContainer,
  InformationBar,
  InputWrapper,
} from './styles';
import { IncreasePositionProps } from './types';

const IncreasePosition: React.FC<IncreasePositionProps> = (props) => {
  const { t } = useTranslation();
  const { account } = usePangolinWeb3();
  const toggleWalletModal = useWalletModalToggle();
  const { position: positionDetails } = props;
  const chainId = useChainId();
  const currency0 = positionDetails?.token0 ? unwrappedToken(positionDetails.token0, chainId) : undefined;
  const currency1 = positionDetails?.token1 ? unwrappedToken(positionDetails.token1, chainId) : undefined;

  const currencies = {
    [Field.CURRENCY_A]: currency0,
    [Field.CURRENCY_B]: currency1,
  };

  const { provider, library } = useLibrary();

  const deadline = useTransactionDeadline();
  const [allowedSlippage] = useUserSlippageTolerance();

  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
  }

  const { position: existingPosition } = useDerivedPositionInfo(positionDetails);
  const {
    dependentField,
    noLiquidity,
    parsedAmounts,
    depositADisabled,
    depositBDisabled,
    position: derivedPosition,
  } = useDerivedMintInfo(existingPosition);

  const shouldDisableAddLiquidity: boolean = useMemo(() => {
    // If depositA is not disabled, check if its parsedAmount is greater than 0
    if (!depositADisabled && parsedAmounts[Field.CURRENCY_A]) {
      return false;
    }

    // If depositB is not disabled, check if its parsedAmount is greater than 0
    if (!depositBDisabled && parsedAmounts[Field.CURRENCY_B]) {
      return false;
    }

    // If neither condition above is met, disable the addLiquidity button
    return true;
  }, [depositADisabled, depositBDisabled, parsedAmounts]);

  const { independentField, typedValue } = useMintState();
  const { onFieldAInput, onFieldBInput, onCurrencySelection, onSetFeeAmount, onResetMintState } =
    useMintActionHandlers(noLiquidity);

  const selectedCurrencyBalanceA = useCurrencyBalance(chainId, account ?? undefined, currency0 ?? undefined);
  const selectedCurrencyBalanceB = useCurrencyBalance(chainId, account ?? undefined, currency1 ?? undefined);

  const useUSDCPrice = useUSDCPriceHook[chainId];

  const usdcValues = {
    [Field.CURRENCY_A]: useUSDCPrice(positionDetails?.token0 ?? undefined),
    [Field.CURRENCY_B]: useUSDCPrice(positionDetails?.token1 ?? undefined),
  };

  const usdcValueCurrencyA = usdcValues[Field.CURRENCY_A];
  const usdcValueCurrencyB = usdcValues[Field.CURRENCY_B];
  const currencyAFiat = useMemo(
    () => ({
      data: usdcValueCurrencyA ? parseFloat(usdcValueCurrencyA.toSignificant()) : undefined,
      isLoading: false,
    }),
    [usdcValueCurrencyA],
  );

  const currencyBFiat = useMemo(
    () => ({
      data: usdcValueCurrencyB ? parseFloat(usdcValueCurrencyB.toSignificant()) : undefined,
      isLoading: false,
    }),
    [usdcValueCurrencyB],
  );

  const theme = useContext(ThemeContext);

  const fiatOfLiquidity = useMemo(() => {
    if (currencyAFiat.data && currencyBFiat.data) {
      return (
        parseFloat(parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '0') * currencyAFiat.data +
        parseFloat(parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '0') * currencyBFiat.data
      );
    }
    return 0;
  }, [currencyAFiat, currencyBFiat, parsedAmounts]);

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };
  const addLiquidity = useElixirAddLiquidityHook[chainId]();

  async function onIncrease() {
    if (!chainId || !library || !account || !provider) return;

    if (!positionDetails?.token0 || !positionDetails?.token1) {
      return;
    }

    try {
      setAttempting(true);
      const addData = {
        parsedAmounts,
        deadline,
        noLiquidity,
        allowedSlippage,
        currencies,
        position: derivedPosition,
        tokenId: positionDetails?.tokenId,
        hasExistingPosition: !!positionDetails,
      };

      const response = await addLiquidity(addData);

      setHash(response?.hash as string);
      if (response?.hash) {
        mixpanel.track(MixPanelEvents.INCREASE_LIQUIDITY, {
          chainId: chainId,
          tokenA: positionDetails?.token0?.symbol,
          tokenB: positionDetails?.token1?.symbol,
          tokenA_Address: wrappedCurrency(positionDetails?.token0, chainId)?.address,
          tokenB_Address: wrappedCurrency(positionDetails?.token1, chainId)?.address,
        });
      }
      onResetMintState();
    } catch (err) {
      const _err = typeof err === 'string' ? new Error(err) : (err as any);
      setError(_err?.message);
      console.error(_err);
    } finally {
      setAttempting(false);
    }
  }

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal} height="46px">
          {t('common.connectWallet')}
        </Button>
      );
    } else {
      return (
        <ButtonWrapper>
          <Button
            isDisabled={shouldDisableAddLiquidity}
            height="46px"
            variant="primary"
            borderRadius="4px"
            onClick={onIncrease}
          >
            {t('common.addLiquidity')}
          </Button>
        </ButtonWrapper>
      );
    }
  };

  useEffect(() => {
    if (positionDetails?.token0 && positionDetails?.token1) {
      positionDetails?.token0 && onCurrencySelection(Field.CURRENCY_A, positionDetails?.token0);
      positionDetails?.token1 && onCurrencySelection(Field.CURRENCY_B, positionDetails?.token1);
    }
    if (positionDetails?.fee) {
      onSetFeeAmount(positionDetails?.fee);
    }
  }, [positionDetails]);

  return (
    <div>
      {attempting && !hash && !error && (
        <BlackWrapper>
          <Loader height={'auto'} size={100} label={` Adding...`} />
        </BlackWrapper>
      )}

      {hash && (
        <BlackWrapper>
          <TransactionCompleted
            rootStyle={{ width: '100%' }}
            buttonText={t('common.close')}
            isShowButtton={true}
            onButtonClick={wrappedOnDismiss}
            submitText={t('pool.liquidityAdded')}
          />
        </BlackWrapper>
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
            <ButtonWrapper>
              <Button height="46px" variant="primary" borderRadius="4px" onClick={wrappedOnDismiss}>
                {t('transactionConfirmation.dismiss')}
              </Button>
            </ButtonWrapper>
          </ErrorWrapper>
        </BlackWrapper>
      )}

      <Text
        color="text1"
        fontSize={[22, 18]}
        fontWeight={500}
        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {t('elixir.increasePosition.title')}
      </Text>

      <div>
        <AddWrapper>
          <Box flex={1}>
            <InputWrapper>
              {depositADisabled ? (
                <OutofRangeWarning
                  label={`Token 1`}
                  message={t('elixir.singleAssetDeposit')}
                  addonLabel={<Lock size={18} color={theme?.textInput?.labelText} />}
                />
              ) : (
                <CurrencyInput
                  label={`Token 1`}
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
                  labelColor={'text1'}
                  fontSize={16}
                  isNumeric={true}
                  style={{ borderRadius: 4, alignItems: 'center' }}
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

              <Box
                width="100%"
                textAlign="center"
                alignItems="center"
                display={'flex'}
                justifyContent={'center'}
                mt={10}
              >
                <ArrowWrapper>
                  <img src={shuffle} alt="shuffle" />
                </ArrowWrapper>
              </Box>
              {depositBDisabled ? (
                <OutofRangeWarning
                  label={`Token 2`}
                  message={t('elixir.singleAssetDeposit')}
                  addonLabel={<Lock size={18} color={theme?.textInput?.labelText} />}
                />
              ) : (
                <CurrencyInput
                  label={`Token 2`}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onChange={(value: any) => {
                    onFieldBInput(value);
                  }}
                  buttonStyle={{
                    cursor: 'default',
                  }}
                  style={{ borderRadius: 4, alignItems: 'center' }}
                  showArrowIcon={false}
                  onTokenClick={() => {}}
                  currency={currency1}
                  labelColor={'text1'}
                  fontSize={16}
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
            </InputWrapper>
          </Box>
        </AddWrapper>
        <InformationBar>
          <GridContainer>
            <Box>
              <Stat
                title={`Dollar Worth:`}
                stat={fiatOfLiquidity ? `$${fiatOfLiquidity.toFixed(2)}` : '-'}
                titlePosition="top"
                titleFontSize={12}
                statFontSize={14}
                titleColor="text8"
              />
            </Box>

            <Box>
              <Stat
                title={`Pool Share:`}
                stat={'-'}
                titlePosition="top"
                titleFontSize={12}
                statFontSize={14}
                titleColor="text8"
              />
            </Box>
          </GridContainer>
        </InformationBar>
        <Box width="100%">{renderButton()}</Box>
      </div>
    </div>
  );
};

export default IncreasePosition;
