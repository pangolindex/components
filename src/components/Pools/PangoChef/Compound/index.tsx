/* eslint-disable max-lines */
import { formatUnits } from '@ethersproject/units';
import { CAVAX, ChainId, CurrencyAmount, Fraction, JSBI, Price, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { parseUnits } from 'ethers/lib/utils';
import numeral from 'numeral';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, Text, TextInput, Tooltip, TransactionCompleted } from 'src/components';
import { FARM_TYPE, ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { usePair } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useTokensCurrencyPriceHook } from 'src/hooks/multiChainsHooks';
import { useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import { usePangoChefContract } from 'src/hooks/useContract';
import { usePangoChefCompoundCallbackHook } from 'src/state/ppangoChef/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { calculateCompoundSlippage } from 'src/state/ppangoChef/utils';
import { useAccountBalanceHook, useTokenBalancesHook } from 'src/state/pwallet/hooks';
import { hederaFn } from 'src/utils/hedera';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { Buttons, CompoundWrapper, ErrorBox, ErrorWrapper, Root, WarningMessageWrapper } from './styleds';

export interface CompoundProps {
  stakingInfo: PangoChefInfo;
  onClose: () => void;
}
const CompoundV3 = ({ stakingInfo, onClose }: CompoundProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  const [confirm, setConfirm] = useState(false);
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);
  const [compoundError, setCompound] = useState<string | undefined>();

  const pangoChefContract = usePangoChefContract();

  const useCompoundCallback = usePangoChefCompoundCallbackHook[chainId];
  const useApproveCallback = useApproveCallbackHook[chainId];
  const useTokenBalances = useTokenBalancesHook[chainId];
  const useTokensCurrencyPrice = useTokensCurrencyPriceHook[chainId];
  const useETHBalances = useAccountBalanceHook[chainId];

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setCompound(undefined);
    onClose();
  }

  const png = PNG[chainId];
  const wrappedCurrency = WAVAX[chainId];
  const currency = CAVAX[chainId];

  const [token0, token1] = stakingInfo?.tokens;

  const [, pair] = usePair(token0, token1);

  const currency0 = unwrappedToken(token0, chainId);
  const currency1 = unwrappedToken(token1, chainId);

  const currencyBalance = useETHBalances(chainId, [account ?? ZERO_ADDRESS]);

  const tokensToGetBalances = stakingInfo?.tokens;
  const tokensToGetPrice = stakingInfo?.tokens;

  const isPNGPool = token0.equals(png) || token1.equals(png);
  const isWrappedCurrencyPool = token0.equals(wrappedCurrency) || token1.equals(wrappedCurrency);

  // we need to add wrappedCurrency to get the balance, because it is used in parts of the code
  //and if not have in these two tokens in pair it will disable the compound button forever
  if (!isWrappedCurrencyPool) {
    tokensToGetBalances.push(wrappedCurrency);
  }

  const [tokensBalances] = useTokenBalances(account ?? ZERO_ADDRESS, tokensToGetBalances);

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
  // or for hedera chain we want to consider pbar-whbar pool instead of pbar-hbar pool
  // so for hedera also we want to go into if condition
  if ((isPNGPool && !isWrappedCurrencyPool) || (isPNGPool && hederaFn.isHederaChain(chainId))) {
    // need to calculate the token price in png, for this we using the token price on currency and png price on currency
    const token = token0.equals(png) ? token1 : token0;
    const tokenBalance = tokensBalances[token.address];
    const tokenPrice = tokensPrices[token.address] ?? new Price(token, wrappedCurrency, '1', '0');
    const tokenPngPrice = tokenPrice.equalTo('0') ? new Fraction('0') : pngPrice.divide(tokenPrice);
    let _amount = tokenPngPrice.multiply(earnedAmount.raw);

    // if the tokens have diffent decimals we need to divide this by 1e (png.decimals - token.decimals)
    if (png.decimals !== token.decimals) {
      const exponent = 10 ** (png.decimals - token.decimals);
      _amount = _amount.divide(exponent.toString());
    }

    amountToAdd = new TokenAmount(token, _amount.equalTo('0') ? '0' : _amount.toFixed(0));
    if (amountToAdd.greaterThan(tokenBalance ?? '0')) {
      _error = _error ?? t('stakeHooks.insufficientBalance', { symbol: token.symbol });
    }

    message += t('pangoChef.compoundAmountWarning', {
      amount: numeral(amountToAdd.toFixed(2)).format('0.00a'),
      symbol: token.symbol,
    });
  } else if (!hederaFn.isHederaChain(chainId)) {
    // for anothers chains we can send gas coin
    amountToAdd = CurrencyAmount.ether(
      pngPrice.equalTo('0') || earnedAmount.equalTo('0') ? '0' : pngPrice.raw.multiply(earnedAmount.raw).toFixed(0),
      chainId,
    );
    if (amountToAdd.greaterThan(currencyBalance ? currencyBalance[account ?? ZERO_ADDRESS] ?? '0' : '0')) {
      _error = _error ?? t('stakeHooks.insufficientBalance', { symbol: currency.symbol });
    }

    message += t('pangoChef.compoundAmountWarning', {
      amount: numeral(amountToAdd.toFixed(2)).format('0.00a'),
      symbol: currency.symbol,
    });

    if (!isPNGPool) {
      message += t('pangoChef.compoundAmountWarning2', {
        token0: png.symbol,
        token1: currency.symbol,
      });
    }
  } else {
    // we compound to PNG/WRAPPED GAS COIN (PNG/WAVAX, PFL/WFLR, PSB/WSGB  etc) farm
    // so for hedera we need to send WHBAR instead HBAR
    const wrappedTokenBalance = tokensBalances[wrappedCurrency.address];
    // the png price is in relation (wrapped) gas coin, so just multiply by the earned amount of png
    amountToAdd = new TokenAmount(wrappedCurrency, pngPrice.raw.multiply(earnedAmount.raw).toFixed(0));

    if (amountToAdd.greaterThan(wrappedTokenBalance ?? '0')) {
      _error = _error ?? t('stakeHooks.insufficientBalance', { symbol: wrappedCurrency.symbol });
    }

    message += t('pangoChef.compoundAmountWarning', {
      amount: numeral(amountToAdd.toFixed(2)).format('0.00a'),
      symbol: wrappedCurrency.symbol,
    });

    if (!isPNGPool) {
      message += t('pangoChef.compoundAmountWarning2', {
        token0: png.symbol,
        token1: currency.symbol,
      });
    }
  }

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  const slippage = calculateCompoundSlippage(amountToAdd);
  // if it approve exact value, we need to approve the max slippage value so as not to revert due to missing approval
  const approvalAmount =
    amountToAdd instanceof TokenAmount ? new TokenAmount(amountToAdd.token, slippage.maxPairAmount) : amountToAdd;

  const [approval, approveCallback] = useApproveCallback(chainId, approvalAmount, pangoChefContract?.address);

  const { callback: compoundCallback } = useCompoundCallback({
    isPNGPool,
    poolId: stakingInfo?.pid,
    amountToAdd,
  });

  const mixpanel = useMixpanel();

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

  const userRewardRate = stakingInfo?.userRewardRate;
  /*
  Let's say you get 1 png per sec, and 1 png equals 1 avax.
  In 10 secs you have 10 png rewards. you make a tx to send 10 avax.
  5 more seconds pass until you do the transaction, so you have 15 png rewards, and it needs to be paired with 15 avax. so tx will revert. bad for ux.
  The less pending rewards you have the more pronounced the issue. so you have to wait an hour or so, such that the rewards you receive do not so rapidly increase in proportion to your pending rewards. that's why we have to grey it out.

  1% slippage we have to hard code, otherwise any tx changing the reserve amounts in the pool would make it revert.
  also even after an hour or so, the rewards keep consantly increase, so 0% slippage would never work. 
  */
  if (!earnedAmount.divide(userRewardRate.equalTo('0') ? '1' : userRewardRate).greaterThan(JSBI.BigInt(30 * 55))) {
    _error = _error ?? t('pangoChef.highVolalityWarning');
  }

  const tokenOrCurrency = amountToAdd instanceof TokenAmount ? amountToAdd.token : amountToAdd.currency;

  // Minimium amount to compound
  if (JSBI.LE(amountToAdd.raw, parseUnits('0.0001', tokenOrCurrency.decimals).toString())) {
    _error = _error ?? t('pangoChef.highVolalityWarning');
  }

  async function onCompound() {
    if (pangoChefContract && stakingInfo?.stakedAmount && compoundCallback && pair && !_error) {
      setAttempting(true);
      try {
        const hash = await compoundCallback();
        setHash(hash);

        const tokenA = stakingInfo.tokens[0];
        const tokenB = stakingInfo.tokens[1];
        mixpanel.track(MixPanelEvents.COMPOUND_REWARDS, {
          chainId: chainId,
          tokenA: tokenA?.symbol,
          tokenb: tokenB?.symbol,
          tokenA_Address: tokenA?.symbol,
          tokenB_Address: tokenB?.symbol,
          pid: stakingInfo.pid,
          farmType: FARM_TYPE[3]?.toLowerCase(),
        });
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
      <WarningMessageWrapper>
        <Text color="text1" textAlign="center" fontSize="10px">
          {message}
        </Text>
        <Tooltip id="help" effect="solid" backgroundColor={theme.primary} place="left">
          <Box maxWidth="200px">
            <Text color="eerieBlack" fontSize="12px" fontWeight={500} textAlign="center">
              {/* this condition is just for few days till flare pangochef contracts gets audited. make sure to remove after that */}
              {chainId === ChainId.FLARE_MAINNET
                ? 'This function has not yet been audited. Use at your own discretion.'
                : t('pangoChef.decreaseWarning')}
            </Text>
          </Box>
        </Tooltip>
        <HelpCircle size="16px" data-tip data-for="help" color={theme.text1} />
      </WarningMessageWrapper>
      <Buttons>
        {showApproveFlow && (
          <Button
            variant={approval === ApprovalState.APPROVED ? 'confirm' : 'primary'}
            isDisabled={approval !== ApprovalState.NOT_APPROVED}
            onClick={handleApprove}
          >
            {t('earn.approve')}
          </Button>
        )}
        <Button variant="primary" isDisabled={!!_error || approval !== ApprovalState.APPROVED} onClick={onCompound}>
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
                stakeToken0: isPNGPool ? currency0.symbol : png.symbol,
                stakeToken1: isPNGPool ? currency1.symbol : currency.symbol,
                compoundToken: tokenOrCurrency.symbol,
                png: png.symbol,
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
/* eslint-enable max-lines */
