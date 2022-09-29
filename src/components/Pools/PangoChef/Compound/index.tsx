import { TransactionResponse } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { CAVAX, CurrencyAmount, Fraction, JSBI, Price, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { parseUnits } from 'ethers/lib/utils';
import numeral from 'numeral';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, Text, TextInput, TransactionCompleted } from 'src/components';
import { ONE_FRACTION, PANGOCHEF_COMPOUND_SLIPPAGE, ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { usePair } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { ApprovalState, useApproveCallback } from 'src/hooks/useApproveCallback';
import { usePangoChefContract } from 'src/hooks/useContract';
import { useTokensCurrencyPrice } from 'src/hooks/useCurrencyPrice';
import { useUserPangoChefRewardRate } from 'src/state/ppangoChef/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useTokenBalances } from 'src/state/pwallet/hooks';
import { useAccountBalanceHook } from 'src/state/pwallet/multiChainsHooks';
import { calculateGasMargin, waitForTransaction } from 'src/utils';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { Buttons, CompoundWrapper, ErrorBox, ErrorWrapper, Root } from './styleds';

export interface CompoundProps {
  stakingInfo: PangoChefInfo;
  onClose: () => void;
}
const CompoundV3 = ({ stakingInfo, onClose }: CompoundProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder();

  const [confirm, setConfirm] = useState(false);
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);
  const [compoundError, setCompound] = useState<string | undefined>();

  const pangoChefContract = usePangoChefContract();

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setCompound(undefined);
    onClose();
  }

  const png = PNG[chainId];
  const wrappedCurrency = WAVAX[chainId];
  const currency = CAVAX[chainId];
  const [token0, token1] = stakingInfo.tokens;

  const [, pair] = usePair(token0, token1);

  const currency0 = unwrappedToken(token0, chainId);
  const currency1 = unwrappedToken(token1, chainId);

  const useETHBalances = useAccountBalanceHook[chainId];
  const currencyBalance = useETHBalances(chainId, [account ?? ZERO_ADDRESS]);

  const tokensBalances = useTokenBalances(account ?? ZERO_ADDRESS, [token0, token1]);

  const isPNGPool = token0.equals(png) || token1.equals(png);
  const isWrappedCurrencyPool = token0.equals(wrappedCurrency) || token1.equals(wrappedCurrency);

  const tokensToGetPrice = [token0, token1];

  if (!isPNGPool) {
    tokensToGetPrice.push(png);
  }

  const tokensPrices = useTokensCurrencyPrice(tokensToGetPrice);

  let message = '';

  let _error: string | undefined;
  if (!account) {
    _error = t('earn.connectWallet');
  }
  if (!stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo('0')) {
    _error = _error ?? t('earn.enterAmount');
  }

  const earnedAmount = stakingInfo.earnedAmount;

  const pngPrice = tokensPrices[png.address] ?? new Price(png, wrappedCurrency, '1', '0');
  let amountToAdd: CurrencyAmount | TokenAmount = new TokenAmount(wrappedCurrency, '0');
  // if is png pool and not is wrapped token as second token (eg PNG/USDC, PSB/SDOOD)
  if (isPNGPool && !isWrappedCurrencyPool) {
    // need to calculate the token price in png, for this we using the token price on currency and png price on currency
    const token = token0.equals(png) ? token1 : token0;
    const tokenBalance = tokensBalances[token.address];
    const tokenPrice = tokensPrices[token.address] ?? new Price(token, wrappedCurrency, '1', '0');
    const tokenPngPrice = pngPrice.equalTo('0') ? new Fraction('0') : pngPrice.divide(tokenPrice);
    amountToAdd = new TokenAmount(token, tokenPngPrice.multiply(earnedAmount.raw).toFixed(0));

    if (amountToAdd.greaterThan(tokenBalance ?? '0')) {
      _error = _error ?? t('stakeHooks.insufficientBalance', { symbol: token.symbol });
    }
    message += `${t('pangoChef.compoundAmountWarning', {
      amount: numeral(amountToAdd.toFixed(2)).format('0.00a'),
      symbol: token.symbol,
    })} ${t('pangoChef.compoundAmountWarning2', {
      symbol: token.symbol,
      png: png.symbol,
    })}`;
  } else {
    amountToAdd = CurrencyAmount.ether(pngPrice.raw.multiply(earnedAmount.raw).toFixed(0), chainId);
    if (amountToAdd.greaterThan(currencyBalance ? currencyBalance[account ?? ZERO_ADDRESS] ?? '0' : '0')) {
      _error = _error ?? t('stakeHooks.insufficientBalance', { symbol: currency.symbol });
    }
    message += t('pangoChef.compoundAmountWarning', {
      amount: numeral(amountToAdd.toFixed(2)).format('0.00a'),
      symbol: currency.symbol,
    });
  }

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  const [approval, approveCallback] = useApproveCallback(chainId, amountToAdd, pangoChefContract?.address);

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const showApproveFlow =
    !_error &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    amountToAdd instanceof TokenAmount;

  const handleApprove = useCallback(async () => {
    await approveCallback();
  }, [approveCallback]);

  const userRewardRate = useUserPangoChefRewardRate(stakingInfo);
  /*
  Let's say you get 1 png per sec, and 1 png equals 1 avax.
  In 10 secs you have 10 png rewards. you make a tx to send 10 avax.
  5 more seconds pass until you do the transaction, so you have 15 png rewards, and it needs to be paired with 15 avax. so tx will revert. bad for ux.
  The less pending rewards you have the more pronounced the issue. so you have to wait an hour or so, such that the rewards you receive do not so rapidly increase in proportion to your pending rewards. that's why we have to grey it out.

  1% slippage we have to hard code, otherwise any tx changing the reserve amounts in the pool would make it revert.
  also even after an hour or so, the rewards keep consantly increase, so 0% slippage would never work. 
  */
  if (
    !JSBI.greaterThan(
      JSBI.divide(earnedAmount.raw, JSBI.BigInt(userRewardRate.isZero() ? '1' : userRewardRate.toString())),
      JSBI.BigInt(30 * 55),
    )
  ) {
    _error = _error ?? t('pangoChef.highVolalityWarning');
  }

  const tokenOrCurrency = amountToAdd instanceof TokenAmount ? amountToAdd.token : amountToAdd.currency;

  // Minimium amount to compound
  if (JSBI.LE(amountToAdd.raw, parseUnits('0.0001', tokenOrCurrency.decimals).toString())) {
    _error = _error ?? t('pangoChef.highVolalityWarning');
  }

  async function onCompound() {
    if (pangoChefContract && stakingInfo?.stakedAmount && pair && !_error) {
      setAttempting(true);
      try {
        const method = isPNGPool ? 'compound' : 'compoundToPoolZero';

        const minPairAmount = JSBI.BigInt(
          ONE_FRACTION.subtract(PANGOCHEF_COMPOUND_SLIPPAGE).multiply(amountToAdd.raw).toFixed(0),
        );
        const maxPairAmount = JSBI.BigInt(
          ONE_FRACTION.add(PANGOCHEF_COMPOUND_SLIPPAGE).multiply(amountToAdd.raw).toFixed(0),
        );
        // the minPairAmount and maxPairAmount is amount of other token/currency to sent to compound with slippage tolerance
        const slippage = {
          minPairAmount: JSBI.lessThan(minPairAmount, JSBI.BigInt(0)) ? '0x0' : `0x${minPairAmount.toString(16)}`,
          maxPairAmount: `0x${maxPairAmount.toString(16)}`,
        };
        const estimatedGas = await pangoChefContract.estimateGas[method](
          Number(stakingInfo.pid).toString(16),
          slippage,
          { value: amountToAdd instanceof TokenAmount ? '0x0' : `0x${maxPairAmount.toString(16)}` },
        );
        const response: TransactionResponse = await pangoChefContract[method](
          Number(stakingInfo.pid).toString(16),
          slippage,
          {
            gasLimit: calculateGasMargin(estimatedGas),
            value: amountToAdd instanceof TokenAmount ? '0x0' : `0x${maxPairAmount.toString(16)}`,
          },
        );
        await waitForTransaction(response, 1);
        addTransaction(response, {
          summary: t('pangoChef.compoundTransactionSummary'),
        });
        setHash(response.hash);
      } catch (error) {
        const err = error as any;
        // we only care if the error is something _other_ than the user rejected the tx
        if (err?.code !== 4001) {
          setCompound(err?.message);
          console.error(err);
        }
      } finally {
        setAttempting(false);
      }
    }
  }

  const renderDrawer = () => {
    if (compoundError) {
      return (
        <ErrorWrapper paddingX="30px" paddingBottom="30px">
          <ErrorBox>
            <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="center" style={{ width: '85%' }}>
              {compoundError}
            </Text>
          </ErrorBox>
          <Button variant="primary" onClick={onClose}>
            {t('transactionConfirmation.dismiss')}
          </Button>
        </ErrorWrapper>
      );
    }
    if (attempting) {
      return <Loader size={100} label={`${t('sarCompound.pending')}...`} />;
    }
    if (hash) {
      return <TransactionCompleted onClose={wrappedOnDismiss} submitText={t('pangoChef.compoundSuccess')} />;
    }
  };

  const confirmContent = (
    <Box display="grid" padding="10px" style={{ gap: '10px' }} height="100%">
      <TextInput
        addonAfter={
          <Box padding="5px" bgColor="color2" borderRadius="8px">
            <Text color="text1">{tokenOrCurrency.symbol}</Text>
          </Box>
        }
        disabled={true}
        value={formatUnits(amountToAdd.raw.toString(), tokenOrCurrency.decimals)}
      />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding="20px"
        bgColor="color3"
        borderRadius="8px"
        margin="auto"
        width="100%"
        flexGrow={1}
      >
        <Text color="text1" textAlign="center" fontSize="12px">
          {message}
        </Text>
      </Box>
      <Buttons>
        {showApproveFlow && (
          <Button
            variant={approval === ApprovalState.APPROVED ? 'confirm' : 'primary'}
            isDisabled={approval !== ApprovalState.NOT_APPROVED}
            onClick={handleApprove}
            height="46px"
          >
            {t('earn.approve')}
          </Button>
        )}
        <Button variant="primary" isDisabled={!!_error} onClick={onCompound}>
          {_error ?? `${t('sarStakeMore.add')} & ${t('sarCompound.compound')}`}
        </Button>
      </Buttons>
    </Box>
  );

  return (
    <CompoundWrapper>
      {!confirm ? (
        <Root>
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
          >
            <Text color="text1" textAlign="center">
              {t('pangoChef.compoundWarning', {
                token0: currency0.symbol,
                token1: currency1.symbol,
                currency: isPNGPool ? currency0.symbol : currency.symbol,
                png: isPNGPool ? currency1.symbol : png.symbol,
              })}
            </Text>
          </Box>

          <Box width="100%" mt="10px">
            <Button variant="primary" onClick={() => setConfirm(true)}>
              {t('sarCompound.compound')}
            </Button>
          </Box>
        </Root>
      ) : !compoundError && !attempting && !hash ? (
        confirmContent
      ) : (
        renderDrawer()
      )}
    </CompoundWrapper>
  );
};
export default CompoundV3;
