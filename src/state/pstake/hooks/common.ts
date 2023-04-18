import { CHAINS, ChefType, CurrencyAmount, JSBI, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_INT_ZERO, ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { usePairTotalSupplyHook } from 'src/data/multiChainsHooks';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useTokensHook } from 'src/hooks/tokens';
import { useMiniChefContract, useRewardViaMultiplierContract } from 'src/hooks/useContract';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { useSingleCallResult, useSingleContractMultipleData } from 'src/state/pmulticall/hooks';
import { tryParseAmount } from 'src/state/pswap/hooks/common';
import { usePairBalanceHook } from 'src/state/pwallet/hooks';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { DoubleSideStakingInfo, MinichefStakingInfo } from '../types';

export const useMinichefPools = (): { [key: string]: number } => {
  const minichefContract = useMiniChefContract();
  const lpTokens = useSingleCallResult(minichefContract, 'lpTokens', []).result;
  const lpTokensArr = lpTokens?.[0];

  return useMemo(() => {
    const poolMap: { [key: string]: number } = {};
    if (lpTokensArr) {
      lpTokensArr.forEach((address: string, index: number) => {
        poolMap[address] = index;
      });
    }
    return poolMap;
  }, [lpTokensArr]);
};

/**
 * This hook return the pending rewards and multipliers of extra tokens give by farm
 * @param miniChefStaking staking info with farm values
 * @returns rewardTokensAmount is an array of tokens pending rewards,
 * rewardTokensMultiplier is an array of tokens multipliers
 */
export function useExtraPendingRewards(miniChefStaking: DoubleSideStakingInfo | null) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const useTokens = useTokensHook[chainId];
  const rewardData = useRef(
    {} as {
      rewardTokensAmount: TokenAmount[];
      rewardTokensMultiplier: JSBI[];
    },
  );

  const rewardAddress = miniChefStaking?.rewardsAddress;
  const rewardContract = useRewardViaMultiplierContract(rewardAddress !== ZERO_ADDRESS ? rewardAddress : undefined);
  const getRewardTokensRes = useSingleCallResult(
    miniChefStaking?.rewardTokensAddress ? undefined : rewardContract, // we don't need to make this contract call if exist this value in stakinginfo
    'getRewardTokens',
  );
  const getRewardMultipliersRes = useSingleCallResult(
    miniChefStaking?.rewardTokensMultiplier ? undefined : rewardContract, // same above
    'getRewardMultipliers',
  );

  const earnedAmount = useMemo(() => {
    // else if exist miniChefStaking.earnedAmount use this
    if (miniChefStaking?.earnedAmount) {
      return miniChefStaking.earnedAmount;
    }
    return new TokenAmount(PNG[chainId], '0');
  }, [miniChefStaking?.earnedAmount, chainId]);

  const emptyArr = useMemo(() => [], []);

  const rewardTokensAddress: string[] = useMemo(() => {
    if ((miniChefStaking as MinichefStakingInfo)?.rewardTokens) {
      return emptyArr;
    }

    return miniChefStaking?.rewardTokensAddress
      ? miniChefStaking?.rewardTokensAddress
      : getRewardTokensRes?.result?.[0]?.map();
  }, [getRewardTokensRes, emptyArr, miniChefStaking]);

  const rewardTokensMultiplier = useMemo(() => {
    if (miniChefStaking?.rewardTokensMultiplier) {
      return miniChefStaking.rewardTokensMultiplier;
    }

    return getRewardMultipliersRes?.result?.[0]?.map((multiplier) => JSBI.BigInt(multiplier?.toString() || 0));
  }, [getRewardMultipliersRes, miniChefStaking]);
  const earnedAmountStr = earnedAmount ? JSBI.BigInt(earnedAmount?.raw).toString() : JSBI.BigInt(0).toString();

  const pendingTokensParams = useMemo(() => [[0, account as string, earnedAmountStr]], [account, earnedAmountStr]);
  const pendingTokensRes = useSingleContractMultipleData(
    rewardContract,
    'pendingTokens',
    account ? pendingTokensParams : emptyArr,
  );

  const isLoading = pendingTokensRes?.[0]?.loading;
  const _rewardTokens = useTokens(rewardTokensAddress);

  const rewardTokens = useMemo(() => {
    const stakingInfo = miniChefStaking as MinichefStakingInfo;
    if (stakingInfo?.rewardTokens) {
      return stakingInfo.rewardTokens;
    }
    return _rewardTokens;
  }, [_rewardTokens, miniChefStaking]);

  const rewardAmounts = pendingTokensRes?.[0]?.result?.amounts || emptyArr; // eslint-disable-line react-hooks/exhaustive-deps

  const rewardTokensAmount = useMemo(() => {
    if (!rewardTokens) return emptyArr;

    return rewardTokens.map((rewardToken, index) => new TokenAmount(rewardToken as Token, rewardAmounts[index] || 0));
  }, [rewardAmounts, rewardTokens]);

  useEffect(() => {
    if (!isLoading) {
      rewardData.current = {
        rewardTokensAmount,
        rewardTokensMultiplier,
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardTokens, rewardTokensAmount, rewardTokensMultiplier, isLoading]);

  return rewardData.current;
}

export function useGetPoolDollerWorth(pair: Pair | null) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const usePairBalance = usePairBalanceHook[chainId];
  const usePairTotalSupply = usePairTotalSupplyHook[chainId];
  const _useUSDCPrice = useUSDCPriceHook[chainId];
  const token0 = pair?.token0;
  const currency0 = unwrappedToken(token0 as Token, chainId);
  const currency0PriceTmp = _useUSDCPrice(currency0);
  const currency0Price = CHAINS[chainId]?.mainnet ? currency0PriceTmp : undefined;

  const userPgl = usePairBalance(account ?? undefined, pair ?? undefined);
  const totalPoolTokens = usePairTotalSupply(pair ?? undefined);

  const [token0Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPgl &&
    JSBI.greaterThan(totalPoolTokens.raw, BIG_INT_ZERO) &&
    JSBI.greaterThan(userPgl.raw, BIG_INT_ZERO) &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPgl.raw)
      ? pair.getLiquidityValues(totalPoolTokens, userPgl, { feeOn: false })
      : [undefined, undefined];

  let liquidityInUSD = 0;

  if (CHAINS[chainId]?.mainnet && currency0Price && token0Deposited) {
    liquidityInUSD = Number(currency0Price.toFixed()) * 2 * Number(token0Deposited?.toSignificant(6));
  }

  return useMemo(
    () => ({
      userPgl,
      liquidityInUSD,
    }),
    [userPgl, liquidityInUSD],
  );
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken, chainId);
  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
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
 * here we can get rewards tokens from addresses or from array
 * @param stakingInfo
 * @returns rewardTokens
 */
export function useGetRewardTokens(stakingInfo: DoubleSideStakingInfo) {
  const chainId = useChainId();
  const useTokens = useTokensHook[chainId];

  const cheftType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

  function getRewardsTokensAddresses() {
    // for another minichefs, if there is an array of reward tokens (stakingInfo.rewardTokens)
    // we don't need to query for the tokens, so the addresses can be undefined
    const _stakingInfo = stakingInfo as MinichefStakingInfo;
    if (cheftType !== ChefType.MINI_CHEF && _stakingInfo?.rewardTokens && _stakingInfo?.rewardTokens?.length > 0) {
      return undefined;
    }

    return stakingInfo?.rewardTokensAddress;
  }

  const tokensAddresses = getRewardsTokensAddresses();

  const _rewardTokens = useTokens(tokensAddresses);

  return useMemo(() => {
    const rewardTokens =
      cheftType === ChefType.MINI_CHEF ? undefined : (stakingInfo as MinichefStakingInfo).rewardTokens;

    if (!rewardTokens && _rewardTokens) {
      // filter only tokens
      const tokens = _rewardTokens.filter((token) => token && token instanceof Token) as Token[];
      return tokens;
    }
    return rewardTokens;
  }, [_rewardTokens, cheftType, stakingInfo]);
}
