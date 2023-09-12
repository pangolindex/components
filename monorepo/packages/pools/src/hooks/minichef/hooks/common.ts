import { CHAINS, ChefType, CurrencyAmount, JSBI, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import {
  BIG_INT_ZERO,
  ZERO_ADDRESS,
  tryParseAmount,
  unwrappedToken,
  useChainId,
  usePangolinWeb3,
  useTranslation,
} from '@honeycomb/shared';
import {
  CallState,
  useMultipleContractMultipleData,
  useSingleCallResult,
  useTokensHook,
  useUSDCPriceHook,
} from '@honeycomb/state-hooks';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis';
import { usePairTotalSupplyHook } from 'src/hooks/pair';
import { useMiniChefContract } from 'src/hooks/useContract';
import { usePairBalanceHook } from 'src/hooks/wallet/hooks';
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
 * @param stakingInfo staking info with farm values
 * @returns rewardTokensAmount is an array of tokens pending rewards,
 * rewardTokensMultiplier is an array of tokens multipliers
 */
export function useExtraPendingRewards(stakingInfo: DoubleSideStakingInfo | null): {
  rewardTokensAmount: TokenAmount[];
  rewardTokensMultiplier: JSBI[];
} {
  const emptyArr = useMemo(() => [], []);

  const rewardTokens = useGetRewardTokens(stakingInfo ?? undefined);

  return useMemo(() => {
    const _stakingInfo = stakingInfo as MinichefStakingInfo | null;
    const rewardTokensAddresses = _stakingInfo?.rewardTokensAddress;
    const rewardAmounts = _stakingInfo?.extraPendingRewards;
    const rewardTokensMultipliers = _stakingInfo?.rewardTokensMultiplier;

    if (
      !rewardTokens ||
      !rewardAmounts ||
      rewardAmounts?.length === 0 ||
      !rewardTokensAddresses ||
      rewardTokensAddresses?.length === 0 ||
      !rewardTokensMultipliers ||
      rewardTokensMultipliers?.length === 0
    ) {
      return { rewardTokensAmount: emptyArr, rewardTokensMultiplier: emptyArr };
    }

    // remove null and undefined from array
    return (rewardTokens.filter((token) => token instanceof Token) as Token[]).reduce(
      (memo, rewardToken) => {
        // find the index case the arrays not is in order
        const index = rewardTokensAddresses
          .map((address) => address.toLowerCase())
          .indexOf(rewardToken?.address?.toLowerCase());

        const amount = rewardAmounts[index];
        const multipler = rewardTokensMultipliers[index];

        // does not have the address of this token in the address array of the contract response
        if (index < 0 || index > rewardAmounts.length || !amount || !multipler) {
          return memo;
        }

        memo.rewardTokensAmount.push(new TokenAmount(rewardToken, amount));
        memo.rewardTokensMultiplier.push(multipler);
        return memo;
      },
      { rewardTokensAmount: [] as TokenAmount[], rewardTokensMultiplier: [] as JSBI[] },
    );
  }, [stakingInfo, rewardTokens]);
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
export function useGetRewardTokens(stakingInfo: DoubleSideStakingInfo | undefined) {
  const chainId = useChainId();
  const useTokens = useTokensHook[chainId];

  const cheftType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

  const tokensAddresses = useMemo(() => {
    if (!stakingInfo) return undefined;

    // for another minichefs, if there is an array of reward tokens (stakingInfo.rewardTokens)
    // we don't need to query for the tokens, so the addresses can be undefined
    const _stakingInfo = stakingInfo as MinichefStakingInfo;
    if (cheftType !== ChefType.MINI_CHEF && _stakingInfo?.rewardTokens && _stakingInfo?.rewardTokens?.length > 0) {
      return undefined;
    }

    return stakingInfo?.rewardTokensAddress;
  }, [stakingInfo]);

  const _rewardTokens = useTokens(tokensAddresses);

  return useMemo(() => {
    if (!stakingInfo) return undefined;

    const rewardTokens =
      cheftType === ChefType.MINI_CHEF ? undefined : (stakingInfo as MinichefStakingInfo)?.rewardTokens;

    if (!rewardTokens && _rewardTokens) {
      // filter only tokens
      const tokens = _rewardTokens.filter((token) => token && token instanceof Token) as Token[];
      return tokens;
    }
    return rewardTokens;
  }, [_rewardTokens, cheftType, stakingInfo]);
}

export function useGetExtraPendingRewards(
  rewardsAddresses: (string | undefined)[],
  userPendingRewardsState: CallState[],
) {
  const { account } = usePangolinWeb3();

  const pendingTokensParams = useMemo(() => {
    const params: [0, string, string][] = [];
    for (let index = 0; index < rewardsAddresses.length; index++) {
      const userPendingRewardRes = userPendingRewardsState[index]?.result as BigNumber | undefined;
      params.push([0, account ?? ZERO_ADDRESS, userPendingRewardRes ? userPendingRewardRes.toString() : '0']);
    }
    return params;
  }, [account, userPendingRewardsState]);

  const extraPendingTokensRewardsState = useMultipleContractMultipleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'pendingTokens',
    pendingTokensParams,
  );

  return extraPendingTokensRewardsState;
}
