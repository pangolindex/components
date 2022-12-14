import { BigNumber } from '@ethersproject/bignumber';
import { JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useMixpanel } from 'src/hooks/mixpanel';
import { useApproveCallbackHook, useUSDCPriceHook } from 'src/hooks/multiChainsHooks';
import { useSarStakingContract } from 'src/hooks/useContract';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import { CallState } from '../pmulticall/hooks';
import { useDerivedStakeInfo } from '../pstake/hooks';
import { tryParseAmount } from '../pswap/hooks';
import { useTransactionAdder } from '../ptransactions/hooks';
import { useTokenBalanceHook } from '../pwallet/multiChainsHooks';
import { Position, URI } from './types';

/**
 *
 * @returns Returns the defaults functions used for all sar stake hooks
 */
export function useDefaultSarStake() {
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(4);
  const [stakeError, setStakeError] = useState<string | null>(null);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();

  const addTransaction = useTransactionAdder();
  const { t } = useTranslation();

  const png = PNG[chainId];

  const useTokenBalance = useTokenBalanceHook[chainId];
  const userPngBalance = useTokenBalance(account ?? ZERO_ADDRESS, png);

  // used for max input button
  const maxAmountInput = maxAmountSpend(chainId, userPngBalance);

  const useUSDCPrice = useUSDCPriceHook[chainId];
  const usdcPrice = useUSDCPrice(png);
  const dollerWorth =
    userPngBalance?.greaterThan('0') && usdcPrice ? Number(typedValue) * Number(usdcPrice.toFixed()) : undefined;

  const wrappedOnDismiss = useCallback(() => {
    setStakeError(null);
    setTypedValue('');
    setStepIndex(0);
    setHash(null);
    setAttempting(false);
  }, []);

  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, png, userPngBalance);

  const mixpanel = useMixpanel();

  const onUserInput = useCallback((_typedValue: string) => {
    setTypedValue(_typedValue);
  }, []);

  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
    setStepIndex(4);
  }, [maxAmountInput, onUserInput]);

  const onChangePercentage = (value: number) => {
    if (!userPngBalance) {
      setTypedValue('0');
      return;
    }
    if (value === 100) {
      setTypedValue((userPngBalance as TokenAmount).toExact());
    } else if (value === 0) {
      setTypedValue('0');
    } else {
      const newAmount = (userPngBalance as TokenAmount)
        .multiply(JSBI.BigInt(value))
        .divide(JSBI.BigInt(100)) as TokenAmount;

      setTypedValue(newAmount.toSignificant(6));
    }
  };

  const useApproveCallback = useApproveCallbackHook[chainId];
  const [approval, approveCallback] = useApproveCallback(chainId, parsedAmount, sarStakingContract?.address);

  return {
    account,
    approval,
    approveCallback,
    chainId,
    png,
    attempting,
    setAttempting,
    hash,
    setHash,
    typedValue,
    stepIndex,
    setStepIndex,
    stakeError,
    setStakeError,
    sarStakingContract,
    addTransaction,
    t,
    dollerWorth,
    wrappedOnDismiss,
    mixpanel,
    parsedAmount,
    error,
    handleMax,
    onChangePercentage,
    onUserInput,
  };
}

/**
 * Format the onchain data for all useSarPositions hooks
 * @param nftsURIs Array of the nft URI
 * @param nftsIndexes Array of array of the nft id `[[0x1], [0x2], [0x3]...]`
 * @param positionsAmountState The array of call state with staked amount of each position
 * @param positionsRewardRateState The array of call state with reward rate of each position
 * @param positionsPedingRewardsState The array of call state with peding amount of each position
 * @returns Returns the Array of Positions
 */
export function formatPosition(
  nftsURIs: URI[],
  nftsIndexes: string[][],
  positionsAmountState: CallState[],
  positionsRewardRateState: CallState[],
  positionsPedingRewardsState: CallState[],
) {
  const positions: Position[] = nftsURIs.map((uri, index) => {
    const valueVariables: { balance: BigNumber; sumOfEntryTimes: BigNumber } | undefined =
      positionsAmountState[index].result?.valueVariables;
    const rewardRate = positionsRewardRateState[index].result?.[0];
    const pendingRewards = positionsPedingRewardsState[index].result?.[0];
    const id = nftsIndexes[index][0];
    const balance = valueVariables?.balance ?? BigNumber.from(0);
    const apr = rewardRate
      ?.mul(86400)
      .mul(365)
      .mul(100)
      .div(balance.isZero() ? 1 : balance);

    if (!valueVariables || !rewardRate || !pendingRewards || !uri) {
      return {} as Position;
    }

    return {
      id: BigNumber.from(id),
      balance: valueVariables?.balance,
      sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
      apr: apr,
      rewardRate: rewardRate,
      uri: uri,
      pendingRewards: pendingRewards,
    } as Position;
  });
  // remove the empty positions
  return { positions: positions.filter((position) => !!position), isLoading: false };
}

export function useUnstakeParseAmount(typedValue: string, stakingToken: Token, userLiquidityStaked?: TokenAmount) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();

  const parsedInput = tryParseAmount(typedValue, stakingToken, chainId);
  const parsedAmount =
    parsedInput && userLiquidityStaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityStaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = t('stakeHooks.connectWallet');
  }
  if (parsedInput && !parsedAmount) {
    error = error ?? t('stakeHooks.insufficientBalance', { symbol: stakingToken.symbol });
  }
  if (!parsedAmount) {
    error = error ?? t('stakeHooks.enterAmount');
  }

  return {
    parsedAmount,
    error,
  };
}

/**
 *
 * @param position The position
 * @returns  Returns the defaults functions used for all sar unstake hooks
 */
export function useDefaultSarUnstake(position: Position | null) {
  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [unstakeError, setUnstakeError] = useState<string | null>(null);

  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const png = PNG[chainId];

  const sarStakingContract = useSarStakingContract();

  const stakedAmount = new TokenAmount(png, (position?.balance ?? 0).toString());

  const { parsedAmount, error } = useUnstakeParseAmount(typedValue, png, stakedAmount);

  // used for max input button
  const maxAmountInput = maxAmountSpend(chainId, stakedAmount);

  const wrappedOnDismiss = useCallback(() => {
    setUnstakeError(null);
    setTypedValue('');
    setStepIndex(0);
    setHash(null);
    setAttempting(false);
  }, []);

  const onUserInput = useCallback((_typedValue: string) => {
    setTypedValue(_typedValue);
  }, []);

  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
    setStepIndex(4);
  }, [maxAmountInput, onUserInput]);

  const onChangePercentage = (value: number) => {
    if (stakedAmount.lessThan('0')) {
      setTypedValue('0');
      return;
    }
    if (value === 100) {
      setTypedValue(stakedAmount.toExact());
    } else if (value === 0) {
      setTypedValue('0');
    } else {
      const newAmount = stakedAmount.multiply(JSBI.BigInt(value)).divide(JSBI.BigInt(100)) as TokenAmount;

      setTypedValue(newAmount.toSignificant(6));
    }
  };

  return {
    typedValue,
    stepIndex,
    chainId,
    setStepIndex,
    unstakeError,
    setUnstakeError,
    attempting,
    setAttempting,
    hash,
    setHash,
    account,
    t,
    addTransaction,
    png,
    sarStakingContract,
    parsedAmount,
    error,
    wrappedOnDismiss,
    onUserInput,
    handleMax,
    onChangePercentage,
  };
}

/**
 *
 * @returns Returns the defaults functions used for all sar unstake hooks
 */
export function useDefaultSarClaim() {
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const { account } = usePangolinWeb3();

  const sarStakingContract = useSarStakingContract();

  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const wrappedOnDismiss = useCallback(() => {
    setClaimError(null);
    setHash(null);
    setAttempting(false);
  }, []);

  return {
    attempting,
    setAttempting,
    hash,
    setHash,
    claimError,
    setClaimError,
    account,
    sarStakingContract,
    t,
    addTransaction,
    wrappedOnDismiss,
  };
}
