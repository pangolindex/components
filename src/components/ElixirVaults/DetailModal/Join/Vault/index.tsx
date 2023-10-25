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
import { useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
// import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import {
  useDerivedElixirVaultInfo,
  useElixirVaultActionHandlers,
  useElixirVaultState,
  useVaultActionHandlers,
} from 'src/state/pelixirVaults/hooks';
import { DepositElixirVaultLiquidityProps, Field } from 'src/state/pelixirVaults/types';
// import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { unwrappedToken, wrappedCurrency } from 'src/utils/wrappedCurrency';
import OutofRangeWarning from './OutofRangeWarning';
import {
  AddWrapper,
  ArrowWrapper,
  BlackWrapper,
  ButtonWrapper,
  ErrorBox,
  GridContainer,
  InformationBar,
  InputWrapper,
} from './styles';
import { JoinVaultProps } from './types';

const JoinVault: React.FC<JoinVaultProps> = (props) => {
  const { t } = useTranslation();
  const { account } = usePangolinWeb3();
  const toggleWalletModal = useWalletModalToggle();
  const { vault } = props;
  const theme = useContext(ThemeContext);
  const chainId = useChainId();

  const currencyA = vault?.poolTokens[0] ? unwrappedToken(vault?.poolTokens[0], chainId) : undefined;
  const currencyB = vault?.poolTokens[1] ? unwrappedToken(vault?.poolTokens[1], chainId) : undefined;
  const useApproveCallback = useApproveCallbackHook[chainId];

  const { parsedAmounts, currencyBalances, dependentField, selectedVaultDetails } = useDerivedElixirVaultInfo();
  const { provider, library } = useLibrary();

  const currencies = {
    [Field.CURRENCY_A]: currencyA,
    [Field.CURRENCY_B]: currencyB,
  };

  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { onUserInput, onClearTransactionData, onCurrencySelection } = useElixirVaultActionHandlers();
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
    onClearTransactionData();
  }

  const currencyBalanceA = currencyBalances[Field.CURRENCY_A];
  const currencyBalanceB = currencyBalances[Field.CURRENCY_B];

  const [approvalA, approveACallback] = useApproveCallback(chainId, parsedAmounts[Field.CURRENCY_A], vault?.address);
  const [approvalB, approveBCallback] = useApproveCallback(chainId, parsedAmounts[Field.CURRENCY_B], vault?.address);

  /**
   *  This function determines if the user has enough balance of selected currencies to perform a transaction.
   *  It uses React's useMemo hook to optimize performance by memorizing the result, until the dependencies change.
   *  @returns {boolean} - Returns true if the user has enough balance, false otherwise.
   */
  const isEnoughBalance = useMemo(() => {
    let isCurrency0Enough = false;
    let isCurrency1Enough = false;
    if (currencyBalanceA && currencyBalanceB && parsedAmounts) {
      if (
        !isCurrency0Enough &&
        parsedAmounts[Field.CURRENCY_A] &&
        !parsedAmounts[Field.CURRENCY_B]?.greaterThan(currencyBalanceA)
      ) {
        isCurrency0Enough = true;
      }

      if (
        !isCurrency1Enough &&
        parsedAmounts[Field.CURRENCY_A] &&
        !parsedAmounts[Field.CURRENCY_B]?.greaterThan(currencyBalanceB)
      ) {
        isCurrency1Enough = true;
      }
    }

    return isCurrency0Enough && isCurrency1Enough;
  }, [currencyBalanceA, currencyBalanceB, parsedAmounts]);

  const { independentField, typedValue } = useElixirVaultState();

  const useUSDCPrice = useUSDCPriceHook[chainId];

  const usdcValues = {
    [Field.CURRENCY_A]: useUSDCPrice(vault?.poolTokens[0] ?? undefined),
    [Field.CURRENCY_B]: useUSDCPrice(vault?.poolTokens[1] ?? undefined),
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

  const { depositLiquidity } = useVaultActionHandlers();

  async function onJoin() {
    if (!chainId || !library || !account || !provider) return;

    if (!vault?.poolTokens[0] || !vault?.poolTokens[1]) {
      return;
    }

    try {
      setAttempting(true);

      const dataForDeposit: DepositElixirVaultLiquidityProps = {
        selectedElixirVault: vault,
        account: account || '',
        amount0: formattedAmounts[Field.CURRENCY_A] || 0,
        amount1: formattedAmounts[Field.CURRENCY_B] || 0,
        library: library,
      };

      const response: any = await depositLiquidity(dataForDeposit, vault.strategyProvider?.[0]);
      if (response?.status === 'rejected') {
        setError(response?.reason.message);
        return;
      } else if (response?.status === 'fulfilled') {
        setHash(response?.value?.hash as string);
        mixpanel.track(MixPanelEvents.JOIN, {
          chainId: chainId,
          tokenA: vault?.poolTokens[0]?.symbol,
          tokenB: vault?.poolTokens[1]?.symbol,
          tokenA_Address: wrappedCurrency(vault?.poolTokens[0], chainId)?.address,
          tokenB_Address: wrappedCurrency(vault?.poolTokens[1], chainId)?.address,
        });
      }
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
          {t('common.connectWallet')}
        </Button>
      );
    } else {
      return (
        <ButtonWrapper>
          {(approvalA === ApprovalState.NOT_APPROVED ||
            approvalA === ApprovalState.PENDING ||
            approvalB === ApprovalState.NOT_APPROVED ||
            approvalB === ApprovalState.PENDING) && (
            <ButtonWrapper>
              {approvalA !== ApprovalState.APPROVED && !disableCurrencyA && (
                <Box
                  width={approvalB !== ApprovalState.APPROVED && disableCurrencyA ? '48%' : '100%'}
                  pr={approvalB === ApprovalState.APPROVED || !disableCurrencyA ? '5px' : '0px'}
                >
                  <Button
                    variant="primary"
                    onClick={approveACallback}
                    isDisabled={approvalA === ApprovalState.PENDING}
                    width={'100%'}
                    loading={approvalA === ApprovalState.PENDING}
                    loadingText={`${t('swapPage.approving')} ${currencies[Field.CURRENCY_A]?.symbol}`}
                    height="46px"
                    borderRadius="4px"
                  >
                    <Text fontSize={12}>{`${t('addLiquidity.approve')} ` + currencies[Field.CURRENCY_A]?.symbol}</Text>
                  </Button>
                </Box>
              )}
              {approvalB !== ApprovalState.APPROVED && !disableCurrencyB && (
                <Box width={approvalA !== ApprovalState.APPROVED && disableCurrencyB ? '48%' : '100%'} pr={'5px'}>
                  <Button
                    variant="primary"
                    onClick={approveBCallback}
                    isDisabled={approvalB === ApprovalState.PENDING}
                    width={'100%'}
                    loading={approvalB === ApprovalState.PENDING}
                    loadingText={`${t('swapPage.approving')} ${currencies[Field.CURRENCY_B]?.symbol}`}
                    height="46px"
                    borderRadius="4px"
                  >
                    <Text fontSize={12}>{`${t('addLiquidity.approve')} ` + currencies[Field.CURRENCY_B]?.symbol}</Text>
                  </Button>
                </Box>
              )}
            </ButtonWrapper>
          )}
          <Button
            isDisabled={
              (approvalA !== ApprovalState.APPROVED && !disableCurrencyA) ||
              (approvalB !== ApprovalState.APPROVED && !disableCurrencyB) ||
              !isEnoughBalance
            }
            height="46px"
            variant="primary"
            borderRadius="4px"
            onClick={() => {
              onJoin();
            }}
          >
            {isEnoughBalance ? t('common.addLiquidity') : t('common.insufficientBalance')}
          </Button>
        </ButtonWrapper>
      );
    }
  };

  const shouldDisableOtherInput = (inputField?: Field): boolean => {
    const ratio = selectedVaultDetails?.ratio;
    if (ratio && ratio <= 0) {
      // Check which field has been inputted
      if (
        inputField === Field.CURRENCY_A &&
        formattedAmounts[Field.CURRENCY_B] &&
        (formattedAmounts[Field.CURRENCY_A] === '0' || formattedAmounts[Field.CURRENCY_A].length === 0)
      ) {
        // Return true to indicate the other input (CURRENCY_B) should be disabled
        return true;
      } else if (
        inputField === Field.CURRENCY_B &&
        formattedAmounts[Field.CURRENCY_A] &&
        (formattedAmounts[Field.CURRENCY_B] === '0' || formattedAmounts[Field.CURRENCY_B].length === 0)
      ) {
        // Return true to indicate the other input (CURRENCY_A) should be disabled
        return true;
      }
    }
    return false; // Default case where other input shouldn't be disabled
  };

  const disableCurrencyA = useMemo(() => {
    return shouldDisableOtherInput(Field.CURRENCY_A);
  }, [selectedVaultDetails?.ratio, formattedAmounts]);

  const disableCurrencyB = useMemo(() => {
    return shouldDisableOtherInput(Field.CURRENCY_B);
  }, [selectedVaultDetails?.ratio, formattedAmounts]);

  useEffect(() => {
    if (vault?.poolTokens[0] && vault?.poolTokens[1]) {
      vault?.poolTokens[0] && onCurrencySelection(Field.CURRENCY_A, vault?.poolTokens[0]);
      vault?.poolTokens[1] && onCurrencySelection(Field.CURRENCY_B, vault?.poolTokens[1]);
    }
  }, [vault]);

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

      <div>
        <AddWrapper>
          <Box flex={1}>
            <InputWrapper>
              {disableCurrencyA ? (
                <OutofRangeWarning
                  label={`${t('common.from')}`}
                  message={'Out of Range. Do single sided staking'}
                  addonLabel={<Lock size={18} color={theme?.textInput?.labelText} />}
                />
              ) : (
                <CurrencyInput
                  label={`Token 1`}
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onChange={(value: any) => {
                    onUserInput(Field.CURRENCY_A, value);
                  }}
                  buttonStyle={{
                    cursor: 'default',
                  }}
                  showArrowIcon={false}
                  onTokenClick={() => {}}
                  currency={currencyA}
                  labelColor={'text1'}
                  fontSize={16}
                  isNumeric={true}
                  style={{ borderRadius: 4, alignItems: 'center' }}
                  placeholder="0.00"
                  id="add-liquidity-currency-input"
                  disabled={!currencyBalanceA}
                  addonLabel={
                    account && (
                      <Text color="text2" fontWeight={500} fontSize={12}>
                        {!!currencyA && currencyBalanceA ? currencyBalanceA?.toSignificant(4) : ' -'}
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
              {disableCurrencyB ? (
                <OutofRangeWarning
                  label={`${t('common.from')}`}
                  message={'Out of Range. Do single sided staking'}
                  addonLabel={<Lock size={18} color={theme?.textInput?.labelText} />}
                />
              ) : (
                <CurrencyInput
                  label={`Token 2`}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onChange={(value: any) => {
                    onUserInput(Field.CURRENCY_B, value);
                  }}
                  buttonStyle={{
                    cursor: 'default',
                  }}
                  style={{ borderRadius: 4, alignItems: 'center' }}
                  showArrowIcon={false}
                  onTokenClick={() => {}}
                  currency={currencyB}
                  labelColor={'text1'}
                  fontSize={16}
                  isNumeric={true}
                  placeholder="0.00"
                  id="swap-currency-input"
                  disabled={!currencyBalanceB}
                  addonLabel={
                    account && (
                      <Text color="text2" fontWeight={500} fontSize={12}>
                        {!!currencyB && currencyBalanceB ? currencyBalanceB?.toSignificant(4) : ' -'}
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

export default JoinVault;
