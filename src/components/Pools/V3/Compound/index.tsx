import { TransactionResponse } from '@ethersproject/providers';
import { CAVAX, CurrencyAmount, Fraction, JSBI, Price, TokenAmount, WAVAX } from '@pangolindex/sdk';
import numeral from 'numeral';
import React, { useContext, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, Text, TextInput, TransactionCompleted } from 'src/components';
import { ONE_FRACTION, PANGOCHEF_COMPOUND_SLIPPAGE, ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { usePangoChefContract } from 'src/hooks/useContract';
import { useTokensCurrenyPrice } from 'src/hooks/useCurrencyPrice';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useETHBalances, useTokenBalances } from 'src/state/pwallet/hooks';
import { waitForTransaction } from 'src/utils';
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
  const [claimError, setCompound] = useState<string | undefined>();

  const pangoChefContract = usePangoChefContract();

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setCompound(undefined);
    onClose();
  }

  const png = PNG[chainId];
  const wrappedCurreny = WAVAX[chainId];
  const curreny = CAVAX[chainId];
  const [token0, token1] = stakingInfo.tokens;

  const currency0 = unwrappedToken(token0, chainId);
  const currency1 = unwrappedToken(token1, chainId);

  const currenyBalance = useETHBalances(chainId, [account ?? ZERO_ADDRESS]);

  const tokensBalances = useTokenBalances(account ?? ZERO_ADDRESS, [token0, token1]);

  const tokensPrices = useTokensCurrenyPrice([token0, token1]);

  const isPNGPool = token0.equals(png) || token1.equals(png);
  const isWrappedCurrenyPool = token0.equals(wrappedCurreny) || token1.equals(wrappedCurreny);

  let message = `You need to add`;

  let _error: string | undefined;
  if (!account) {
    _error = t('earn.connectWallet');
  }
  if (!stakingInfo?.stakedAmount) {
    _error = _error ?? t('earn.enterAmount');
  }

  const earnedAmount = stakingInfo.earnedAmount;
  const pngPrice = tokensPrices[png.address] ?? new Price(png, wrappedCurreny, '1', '0');
  let amountToAdd: CurrencyAmount | TokenAmount = new TokenAmount(wrappedCurreny, '0');
  // if is png pool and not is wrapped token as second token
  if (isPNGPool && !isWrappedCurrenyPool) {
    // need to calculate the token price in png, for this we using the token price on curreny and png price on curreny
    const token = token0.equals(png) ? token1 : token0;
    const tokenBalance = tokensBalances[token.address];
    const tokenPrice = tokensPrices[token.address] ?? new Price(token, wrappedCurreny, '1', '0');
    const tokenPngPrice = pngPrice.equalTo('0') ? new Fraction('0') : tokenPrice.divide(pngPrice);
    amountToAdd = new TokenAmount(token, tokenPngPrice.multiply(earnedAmount.raw).toFixed(0));

    if (amountToAdd.greaterThan(tokenBalance ?? '0')) {
      _error = _error ?? t('stakeHooks.insufficientBalance', { symbol: token.symbol });
    }
    message += ` ${numeral(amountToAdd.toFixed(2)).format('0.00a')} ${
      token.symbol
    } to compound. Be careful that you will be locking your ${token.symbol} ${
      png.symbol
    } pool till you claim the rewards of this pool.`;
  } else {
    amountToAdd = CurrencyAmount.ether(pngPrice.raw.multiply(earnedAmount.raw).toFixed(0), chainId);
    if (amountToAdd.greaterThan(currenyBalance[account ?? ZERO_ADDRESS] ?? '0')) {
      _error = _error ?? t('stakeHooks.insufficientBalance', { symbol: curreny.symbol });
    }
    message += ` ${numeral(amountToAdd.toFixed(2)).format('0.00a')} ${curreny.symbol} to compound.`;
  }

  async function onCompound() {
    if (pangoChefContract && stakingInfo?.stakedAmount) {
      setAttempting(true);
      try {
        const method = isPNGPool ? 'compound' : 'compoundToPoolZero';
        const slippage = {
          minPairAmount: JSBI.BigInt(
            amountToAdd.multiply(ONE_FRACTION.subtract(PANGOCHEF_COMPOUND_SLIPPAGE)).toFixed(0),
          ).toString(16),
          maxPairAmount: amountToAdd.raw.toString(16),
        };
        const ethersParameters =
          amountToAdd instanceof TokenAmount ? undefined : { value: amountToAdd.raw.toString(16) };
        const response: TransactionResponse = await pangoChefContract[method](
          Number(stakingInfo.pid).toString(16),
          slippage,
          ethersParameters,
        );
        await waitForTransaction(response, 1);
        addTransaction(response, {
          summary: t('earn.claimAccumulated', { symbol: 'PNG' }),
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
    if (claimError) {
      return (
        <ErrorWrapper paddingX="30px" paddingBottom="30px">
          <ErrorBox>
            <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="center" style={{ width: '85%' }}>
              {claimError}
            </Text>
          </ErrorBox>
          <Button variant="primary" onClick={onClose}>
            {t('transactionConfirmation.dismiss')}
          </Button>
        </ErrorWrapper>
      );
    }
    if (attempting) {
      return <Loader size={100} label=" Claiming..." />;
    }
    if (hash) {
      return <TransactionCompleted onClose={wrappedOnDismiss} submitText="Your rewards claimed" />;
    }
  };

  const confirmContent = (
    <Box display="grid" padding="10px" style={{ gap: '10px' }} height="100%">
      <TextInput
        addonAfter={
          <Box padding="5px" bgColor="color2" borderRadius="8px">
            <Text color="text1">{curreny.symbol}</Text>
          </Box>
        }
        disabled={true}
        value={amountToAdd.toFixed(2)}
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
        <Button variant="primary" isDisabled={!!_error} onClick={onCompound}>
          {_error ?? `${t('sarStakeMore.add')}&${t('sarCompound.compound')}`}
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
            padding="20px"
            bgColor="color3"
            borderRadius="8px"
            margin="auto"
          >
            <Text color="text1" textAlign="center">
              Compounding your rewards for {currency0.symbol}-{currency1.symbol} farm will get your rewards staked into{' '}
              {curreny.symbol}-{png.symbol} farm. You need to add equal value of {curreny.symbol} token to your accrued{' '}
              {png.symbol} rewards.
            </Text>
          </Box>

          <Button variant="primary" onClick={() => setConfirm(true)}>
            {t('sarCompound.compound')}
          </Button>
        </Root>
      ) : (
        confirmContent
      )}
      {renderDrawer()}
    </CompoundWrapper>
  );
};
export default CompoundV3;
