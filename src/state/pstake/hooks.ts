/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { CHAINS, ChainId, CurrencyAmount, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import axios from 'axios';
import { getAddress, parseUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { SubgraphEnum, getSubgraphClient } from 'src/apollo/client';
import { GET_MINICHEF } from 'src/apollo/minichef';
import {
  BIG_INT_SECONDS_IN_WEEK,
  BIG_INT_TWO,
  BIG_INT_ZERO,
  ONE_TOKEN,
  PANGOLIN_API_BASE_URL,
  ZERO_ADDRESS,
} from 'src/constants';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { PANGOLIN_PAIR_INTERFACE } from 'src/constants/abis/pangolinPair';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import { MINICHEF_ADDRESS } from 'src/constants/address';
import { DAIe, PNG, USDC, USDCe, USDTe, axlUST } from 'src/constants/tokens';
import { PairState, usePair, usePairs } from 'src/data/Reserves';
import { usePairTotalSupplyHook } from 'src/data/multiChainsHooks';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useTokensHook, useUSDCPriceHook } from 'src/hooks/multiChainsHooks';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice';
import { usePairBalanceHook } from 'src/state/pwallet/multiChainsHooks';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { useTokens } from '../../hooks/Tokens';
import { useMiniChefContract, useRewardViaMultiplierContract } from '../../hooks/useContract';
import { tryParseAmount } from '../../state/pswap/hooks';
import { useMultipleContractSingleData, useSingleCallResult, useSingleContractMultipleData } from '../pmulticall/hooks';
import {
  DoubleSideStaking,
  DoubleSideStakingInfo,
  MinichefFarm,
  MinichefFarmReward,
  MinichefStakingInfo,
  MinichefV2,
  StakingInfo,
} from './types';

// Each APR request performs an upper bound of (6 + 11n) subrequests where n = pid count
// API requests cannot exceed 50 subrequests and therefore `chunkSize` is set to 4
// ie (6 + 11(4)) = 50

interface AprResult {
  swapFeeApr: number;
  stakingApr: number;
  combinedApr: number;
}

const pangolinApi = axios.create({
  baseURL: PANGOLIN_API_BASE_URL,
  timeout: 10000,
});

export const fetchChunkedAprs = async (pids: string[], chainId: ChainId, chunkSize = 4) => {
  const pidChunks: string[][] = [];

  for (let i = 0; i < pids.length; i += chunkSize) {
    const pidChunk = pids.slice(i, i + chunkSize);
    pidChunks.push(pidChunk);
  }

  const chunkedResults = await Promise.all(
    pidChunks.map((chunk) => pangolinApi.get<AprResult[]>(`/v2/${chainId}/pangolin/aprs/${chunk.join(',')}`)),
  );

  const datas = chunkedResults.map((response) => response.data);

  return datas.flat();
};

export const sortingOnAvaxStake = (info_a: DoubleSideStakingInfo, info_b: DoubleSideStakingInfo) => {
  // only first has ended
  if (info_a.isPeriodFinished && !info_b.isPeriodFinished) return 1;
  // only second has ended
  if (!info_a.isPeriodFinished && info_b.isPeriodFinished) return -1;
  // greater stake in avax comes first
  return info_a.totalStakedInUsd?.greaterThan(info_b.totalStakedInUsd ?? BIG_INT_ZERO) ? -1 : 1;
};

export const sortingOnStakedAmount = (info_a: DoubleSideStakingInfo, info_b: DoubleSideStakingInfo) => {
  // only the first is being staked, so we should bring the first up
  if (info_a.stakedAmount.greaterThan(BIG_INT_ZERO) && !info_b.stakedAmount.greaterThan(BIG_INT_ZERO)) return -1;
  // only the second is being staked, so we should bring the first down
  if (!info_a.stakedAmount.greaterThan(BIG_INT_ZERO) && info_b.stakedAmount.greaterThan(BIG_INT_ZERO)) return 1;
  return 0;
};

export function useMichefFarmsAprs(pids: string[]) {
  const chainId = useChainId();

  return useQuery(
    ['get-minichef-farms-apr', chainId, pids],
    async () => {
      const aprs = await fetchChunkedAprs(pids, chainId);

      const results: { [x: string]: AprResult } = {}; // key is the pid
      aprs.forEach((value, index) => {
        const pid = pids[index];
        results[pid] = value;
      });

      return results;
    },
    {
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  );
}

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

export function useMinichefPendingRewards(miniChefStaking: StakingInfo | null) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const useTokens = useTokensHook[chainId];
  const rewardData = useRef(
    {} as {
      rewardTokensAmount: TokenAmount[];
      rewardTokensMultiplier: any;
    },
  );

  const rewardAddress = miniChefStaking?.rewardsAddress;
  const rewardContract = useRewardViaMultiplierContract(rewardAddress !== ZERO_ADDRESS ? rewardAddress : undefined);
  const getRewardTokensRes = useSingleCallResult(rewardContract, 'getRewardTokens');
  const getRewardMultipliersRes = useSingleCallResult(rewardContract, 'getRewardMultipliers');

  // this function will always return the maximum value earnedAmount
  const getEarnedAmount = useCallback(() => {
    // else if exist miniChefStaking.earnedAmount use this
    if (miniChefStaking?.earnedAmount) {
      return miniChefStaking.earnedAmount;
    }
    return new TokenAmount(PNG[chainId], '0');
  }, [miniChefStaking?.earnedAmount, chainId]);

  const earnedAmount = getEarnedAmount();

  const rewardTokensAddress = getRewardTokensRes?.result?.[0];

  const rewardTokensMultiplier = getRewardMultipliersRes?.result?.[0];
  const earnedAmountStr = earnedAmount ? JSBI.BigInt(earnedAmount?.raw).toString() : JSBI.BigInt(0).toString();

  const emptyArr = useMemo(() => [], []);

  const pendingTokensParams = useMemo(() => [[0, account as string, earnedAmountStr]], [account, earnedAmountStr]);
  const pendingTokensRes = useSingleContractMultipleData(
    rewardContract,
    'pendingTokens',
    account ? pendingTokensParams : emptyArr,
  );

  const isLoading = pendingTokensRes?.[0]?.loading;
  const rewardTokens = useTokens(rewardTokensAddress);

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
 * here we can get rewardToken from address
 * @param rewardTokens
 * @param rewardTokensAddress
 * @returns rewardTokens
 */
export function useGetRewardTokens(rewardTokens?: Array<Token>, rewardTokensAddress?: Array<string>) {
  const chainId = useChainId();
  const useTokens = useTokensHook[chainId];
  const _rewardTokens = useTokens(rewardTokensAddress);

  return useMemo(() => {
    if (!rewardTokens && _rewardTokens) {
      // filter only tokens
      const tokens = _rewardTokens.filter((token) => token && token instanceof Token) as Token[];
      return tokens;
    }
    return rewardTokens;
  }, [_rewardTokens, rewardTokens]);
}

export const calculateTotalStakedAmountInAvax = function (
  amountStaked: JSBI,
  amountAvailable: JSBI,
  reserveInWavax: JSBI,
  chainId: ChainId,
): TokenAmount {
  if (JSBI.GT(amountAvailable, 0)) {
    // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
    return new TokenAmount(
      WAVAX[chainId],
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(amountStaked, reserveInWavax),
          JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
        ),
        amountAvailable,
      ),
    );
  } else {
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));
  }
};

export const calculateTotalStakedAmountInAvaxFromPng = function (
  amountStaked: JSBI,
  amountAvailable: JSBI,
  avaxPngPairReserveOfPng: JSBI,
  avaxPngPairReserveOfWavax: JSBI,
  reserveInPng: JSBI,
  chainId: ChainId,
): TokenAmount {
  if (JSBI.EQ(amountAvailable, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));
  }

  const oneToken = JSBI.BigInt(1000000000000000000);
  const avaxPngRatio = JSBI.divide(JSBI.multiply(oneToken, avaxPngPairReserveOfWavax), avaxPngPairReserveOfPng);
  const valueOfPngInAvax = JSBI.divide(JSBI.multiply(reserveInPng, avaxPngRatio), oneToken);

  return new TokenAmount(
    WAVAX[chainId],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(amountStaked, valueOfPngInAvax),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      amountAvailable,
    ),
  );
};

export const getExtraTokensWeeklyRewardRate = (
  rewardRatePerWeek: TokenAmount,
  token: Token,
  tokenMultiplier: JSBI | undefined,
) => {
  const TEN_EIGHTEEN = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

  const rewardMultiplier = JSBI.BigInt(tokenMultiplier || 1);

  const unadjustedRewardPerWeek = JSBI.multiply(rewardMultiplier, rewardRatePerWeek?.raw);

  const finalReward = JSBI.divide(unadjustedRewardPerWeek, TEN_EIGHTEEN);

  return new TokenAmount(token, finalReward);
};

export const tokenComparator = (
  { address: addressA }: { address: string },
  { address: addressB }: { address: string },
) => {
  // Sort AVAX last
  if (addressA === WAVAX[ChainId.AVALANCHE].address) return 1;
  else if (addressB === WAVAX[ChainId.AVALANCHE].address) return -1;
  // Sort PNG first
  else if (addressA === PNG[ChainId.AVALANCHE].address) return -1;
  else if (addressB === PNG[ChainId.AVALANCHE].address) return 1;
  // Sort axlUST first
  else if (addressA === axlUST[ChainId.AVALANCHE].address) return -1;
  else if (addressB === axlUST[ChainId.AVALANCHE].address) return 1;
  // Sort USDC first
  else if (addressA === USDC[ChainId.AVALANCHE].address) return -1;
  else if (addressB === USDC[ChainId.AVALANCHE].address) return 1;
  // Sort USDCe first
  else if (addressA === USDCe[ChainId.AVALANCHE].address) return -1;
  else if (addressB === USDCe[ChainId.AVALANCHE].address) return 1;
  else return 0;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export const useDummyMinichefHook = (_version?: number, _pairToFilterBy?: Pair | null) => {
  return [] as MinichefStakingInfo[];
};

const dummyApr: AprResult = {
  combinedApr: 0,
  stakingApr: 0,
  swapFeeApr: 0,
};

export const useMinichefStakingInfos = (version = 2, pairToFilterBy?: Pair | null): MinichefStakingInfo[] => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const minichefContract = useMiniChefContract();
  const poolMap = useMinichefPools();
  const lpTokens = Object.keys(poolMap);

  const pids = Object.values(poolMap).map((pid) => pid.toString());

  const { data: farmsAprs } = useMichefFarmsAprs(pids);

  // if chain is not avalanche skip the first pool because it's dummyERC20
  if (chainId !== ChainId.AVALANCHE) {
    lpTokens.shift();
  }

  const _tokens0Call = useMultipleContractSingleData(lpTokens, PANGOLIN_PAIR_INTERFACE, 'token0', []);
  const _tokens1Call = useMultipleContractSingleData(lpTokens, PANGOLIN_PAIR_INTERFACE, 'token1', []);

  const tokens0Adrr = useMemo(() => {
    return _tokens0Call.map((result) => {
      return result.result && result.result.length > 0 ? result.result[0] : null;
    });
  }, [_tokens0Call]);

  const tokens1Adrr = useMemo(() => {
    return _tokens1Call.map((result) => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [_tokens1Call]);

  const tokens0 = useTokens(tokens0Adrr);
  const tokens1 = useTokens(tokens1Adrr);

  const info = useMemo(() => {
    const filterPair = (item: DoubleSideStaking) => {
      if (pairToFilterBy === undefined) {
        return true;
      }
      if (pairToFilterBy === null) {
        return false;
      }
      return pairToFilterBy.involvesToken(item.tokens[0]) && pairToFilterBy.involvesToken(item.tokens[1]);
    };

    const _infoTokens: DoubleSideStaking[] = [];
    if (tokens0 && tokens1 && tokens0?.length === tokens1?.length) {
      tokens0.forEach((token0, index) => {
        const token1 = tokens1[index];
        if (token0 && token1) {
          _infoTokens.push({
            tokens: [token0, token1],
            stakingRewardAddress: minichefContract?.address ?? '',
            version: version,
          });
        }
      });
      return _infoTokens.filter(filterPair);
    }
    return _infoTokens;
  }, [chainId, minichefContract, tokens0, tokens1, pairToFilterBy, version]);

  const _tokens = useMemo(() => (info ? info.map(({ tokens }) => tokens) : []), [info]);
  const pairs = usePairs(_tokens);
  // @dev: If no farms load, you likely loaded an incorrect config from doubleSideConfig.js
  // Enable this and look for an invalid pair

  const pairAddresses = useMemo(() => {
    return pairs.map(([, pair]) => pair?.liquidityToken.address);
  }, [pairs]);

  const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');
  const balances = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'balanceOf', [
    MINICHEF_ADDRESS[chainId],
  ]);

  const [avaxPngPairState, avaxPngPair] = usePair(WAVAX[chainId], PNG[chainId]);

  const poolIdArray = useMemo(() => {
    if (!pairAddresses || !poolMap) return [];

    const NOT_FOUND = -1;
    const results = pairAddresses.map((address) => poolMap[address ?? ''] ?? NOT_FOUND);
    if (results.some((result) => result === NOT_FOUND)) return [];
    return results;
  }, [poolMap, pairAddresses]);

  const poolsIdInput = useMemo(() => {
    if (!poolIdArray) return [];
    return poolIdArray.map((pid) => [pid]);
  }, [poolIdArray]);

  const poolInfos = useSingleContractMultipleData(minichefContract, 'poolInfo', poolsIdInput ?? []);

  const rewarders = useSingleContractMultipleData(minichefContract, 'rewarder', poolsIdInput ?? []);

  const userInfoInput = useMemo(() => {
    if (!poolIdArray || !account) return [];
    return poolIdArray.map((pid) => [pid, account]);
  }, [poolIdArray, account]);

  const userInfos = useSingleContractMultipleData(minichefContract, 'userInfo', userInfoInput ?? []);

  const pendingRewards = useSingleContractMultipleData(minichefContract, 'pendingReward', userInfoInput ?? []);

  const rewardsAddresses = useMemo(() => {
    if ((rewarders || []).length === 0) return [];
    if (rewarders.some((item) => item.loading)) return [];
    return rewarders.map((reward) => reward?.result?.[0]);
  }, [rewarders]);

  const rewardTokensAddresses = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardTokens',
    [],
  );

  const rewardTokensMultipliers = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardMultipliers',
    [],
  );

  const rewardPerSecond = useSingleCallResult(minichefContract, 'rewardPerSecond', []).result;
  const totalAllocPoint = useSingleCallResult(minichefContract, 'totalAllocPoint', []).result;
  const rewardsExpiration = useSingleCallResult(minichefContract, 'rewardsExpiration', []).result;
  const usdPriceTmp = useUSDCPrice(WAVAX[chainId]);
  const usdPrice = CHAINS[chainId]?.mainnet ? usdPriceTmp : undefined;

  return useMemo(() => {
    if (!chainId || !PNG[chainId]) return [];

    return pairAddresses.reduce<any[]>((memo, _pairAddress, index) => {
      const pairTotalSupplyState = pairTotalSupplies[index];
      const balanceState = balances[index];
      const poolInfo = poolInfos[index];
      const userPoolInfo = userInfos[index];
      const [pairState, pair] = pairs[index];
      const pendingRewardInfo = pendingRewards[index];
      const rewardTokensAddress = rewardTokensAddresses[index];
      const rewardTokensMultiplier = rewardTokensMultipliers[index];
      const rewardsAddress = rewardsAddresses[index];

      if (
        pairTotalSupplyState?.loading === false &&
        poolInfo?.loading === false &&
        balanceState?.loading === false &&
        pair &&
        avaxPngPair &&
        pairState !== PairState.LOADING &&
        avaxPngPairState !== PairState.LOADING &&
        rewardPerSecond &&
        totalAllocPoint &&
        rewardsExpiration?.[0] &&
        rewardTokensAddress?.loading === false
      ) {
        if (
          balanceState?.error ||
          pairTotalSupplyState.error ||
          pairState === PairState.INVALID ||
          pairState === PairState.NOT_EXISTS ||
          avaxPngPairState === PairState.INVALID ||
          avaxPngPairState === PairState.NOT_EXISTS
        ) {
          console.error('Failed to load staking rewards info');
          return memo;
        }
        const pid = poolMap[pair.liquidityToken.address].toString();
        // get the LP token
        const token0 = pair?.token0;
        const token1 = pair?.token1;

        const tokens = [token0, token1].sort(tokenComparator);

        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
        const lpToken = dummyPair.liquidityToken;

        const poolAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(poolInfo?.result?.['allocPoint']));
        const totalAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(totalAllocPoint?.[0]));
        const rewardRatePerSecAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(rewardPerSecond?.[0]));
        const poolRewardRate = new TokenAmount(
          PNG[chainId],
          JSBI.divide(JSBI.multiply(poolAllocPointAmount.raw, rewardRatePerSecAmount.raw), totalAllocPointAmount.raw),
        );

        const totalRewardRatePerWeek = new TokenAmount(
          PNG[chainId],
          JSBI.multiply(poolRewardRate.raw, BIG_INT_SECONDS_IN_WEEK),
        );

        const periodFinishMs = rewardsExpiration?.[0]?.mul(1000)?.toNumber();
        // periodFinish will be 0 immediately after a reward contract is initialized
        const isPeriodFinished =
          periodFinishMs === 0 ? false : periodFinishMs < Date.now() || poolAllocPointAmount.equalTo('0');

        const totalSupplyStaked = JSBI.BigInt(balanceState?.result?.[0]);
        const totalSupplyAvailable = JSBI.BigInt(pairTotalSupplyState?.result?.[0]);
        const totalStakedAmount = new TokenAmount(lpToken, JSBI.BigInt(balanceState?.result?.[0]));
        const stakedAmount = new TokenAmount(lpToken, JSBI.BigInt(userPoolInfo?.result?.['amount'] ?? 0));
        const earnedAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(pendingRewardInfo?.result?.['pending'] ?? 0));
        const multiplier = JSBI.BigInt(poolInfo?.result?.['allocPoint']);

        let totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
          ? new TokenAmount(DAIe[chainId], BIG_INT_ZERO)
          : undefined;
        const totalStakedInWavax = new TokenAmount(WAVAX[chainId], BIG_INT_ZERO);

        if (JSBI.equal(totalSupplyAvailable, BIG_INT_ZERO)) {
          // Default to 0 values above avoiding division by zero errors
        } else if (pair.involvesToken(DAIe[chainId])) {
          const pairValueInDAI = JSBI.multiply(pair.reserveOfToken(DAIe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInDAI = JSBI.divide(JSBI.multiply(pairValueInDAI, totalSupplyStaked), totalSupplyAvailable);
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(DAIe[chainId], stakedValueInDAI)
            : undefined;
        } else if (pair.involvesToken(USDCe[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCe[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDC[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDC[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDC[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(axlUST[chainId])) {
          const pairValueInUST = JSBI.multiply(pair.reserveOfToken(axlUST[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUST = JSBI.divide(JSBI.multiply(pairValueInUST, totalSupplyStaked), totalSupplyAvailable);
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(axlUST[chainId], stakedValueInUST)
            : undefined;
        } else if (pair.involvesToken(USDTe[chainId])) {
          const pairValueInUSDT = JSBI.multiply(pair.reserveOfToken(USDTe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDT = JSBI.divide(
            JSBI.multiply(pairValueInUSDT, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDTe[chainId], stakedValueInUSDT)
            : undefined;
        } else if (pair.involvesToken(WAVAX[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvax(
            totalSupplyStaked,
            totalSupplyAvailable,
            pair.reserveOfToken(WAVAX[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else if (pair.involvesToken(PNG[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvaxFromPng(
            totalSupplyStaked,
            totalSupplyAvailable,
            avaxPngPair.reserveOfToken(PNG[chainId]).raw,
            avaxPngPair.reserveOfToken(WAVAX[chainId]).raw,
            pair.reserveOfToken(PNG[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else {
          // Contains no stablecoin, WAVAX, nor PNG
          console.error(`Could not identify total staked value for pair ${pair.liquidityToken.address}`);
        }

        const getHypotheticalWeeklyRewardRate = (
          _stakedAmount: TokenAmount,
          _totalStakedAmount: TokenAmount,
          _totalRewardRatePerSecond: TokenAmount,
        ): TokenAmount => {
          return new TokenAmount(
            PNG[chainId],
            JSBI.greaterThan(_totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(
                  JSBI.multiply(
                    JSBI.multiply(_totalRewardRatePerSecond.raw, _stakedAmount.raw),
                    BIG_INT_SECONDS_IN_WEEK,
                  ),
                  _totalStakedAmount.raw,
                )
              : JSBI.BigInt(0),
          );
        };

        const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(stakedAmount, totalStakedAmount, poolRewardRate);

        const farmApr = farmsAprs?.[pid] ?? dummyApr;

        memo.push({
          pid,
          stakingRewardAddress: MINICHEF_ADDRESS[chainId],
          tokens,
          earnedAmount,
          rewardRatePerWeek: userRewardRatePerWeek,
          totalRewardRatePerSecond: poolRewardRate,
          totalRewardRatePerWeek: totalRewardRatePerWeek,
          stakedAmount,
          totalStakedAmount,
          totalStakedInWavax,
          totalStakedInUsd,
          multiplier,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          isPeriodFinished,
          getHypotheticalWeeklyRewardRate,
          getExtraTokensWeeklyRewardRate,
          rewardTokensAddress: [PNG[chainId]?.address, ...(rewardTokensAddress?.result?.[0] || [])],
          rewardTokensMultiplier: [BigNumber.from(1), ...(rewardTokensMultiplier?.result?.[0] || [])],
          rewardsAddress,
          swapFeeApr: farmApr.swapFeeApr,
          stakingApr: farmApr.stakingApr,
          combinedApr: farmApr.combinedApr,
        });
      }

      return memo;
    }, [] as MinichefStakingInfo[]);
  }, [
    chainId,
    PNG[chainId],
    pairTotalSupplies,
    poolInfos,
    userInfos,
    pairs,
    avaxPngPair,
    avaxPngPairState,
    rewardPerSecond,
    totalAllocPoint,
    pendingRewards,
    rewardsExpiration,
    balances,
    usdPrice,
    pairAddresses,
    rewardTokensAddresses,
    rewardsAddresses,
    rewardTokensMultipliers,
    poolMap,
  ]);
};

export function useMiniChefSubgraphData() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  return useQuery<MinichefV2[]>(
    ['get-minichef-farms-v2', account, chainId],
    async () => {
      const mininchefV2Client = getSubgraphClient(chainId, SubgraphEnum.Minichef);
      if (!mininchefV2Client) {
        return undefined;
      }
      const { minichefs } = await mininchefV2Client.request(GET_MINICHEF, { userAddress: account || '' });
      return minichefs;
    },
    {
      refetchInterval: 1000 * 60 * 5, // 5 minutes
    },
  );
}

// get data for all farms
export const useGetMinichefStakingInfosViaSubgraph = (): MinichefStakingInfo[] => {
  const results = useMiniChefSubgraphData();

  const minichefData = results?.data?.[0];
  const farms = minichefData?.farms;

  const chainId = useChainId();
  const png = PNG[chainId];

  const rewardsExpiration = minichefData?.rewardsExpiration;
  const totalAllocPoint = minichefData?.totalAllocPoint;
  const rewardPerSecond = minichefData?.rewardPerSecond;

  const pids = useMemo(() => {
    if (!farms) return [];

    return farms.map((farm) => farm.pid);
  }, [farms]); // return farms pids in order

  const { data: farmsAprs } = useMichefFarmsAprs(pids);

  const wavax = WAVAX[chainId];

  return useMemo(() => {
    if (!chainId || !png || !farms?.length) return [];

    return farms.reduce(function (memo, farm: MinichefFarm) {
      const rewardsAddress = farm?.rewarderAddress;

      const rewardsAddresses = farm.rewarder.rewards;

      const pair = farm.pair;

      const axlUSTToken = axlUST[chainId];
      const axlUSTAddress = axlUSTToken.address;

      const pairToken0 = pair?.token0;

      const token0 = new Token(
        chainId,
        getAddress(pairToken0.id),
        Number(pairToken0.decimals),
        axlUSTAddress.toLowerCase() === pairToken0.id.toLowerCase() ? axlUSTToken.symbol : pairToken0.symbol,
        pairToken0.name,
      );

      const pairToken1 = pair?.token1;
      const token1 = new Token(
        chainId,
        getAddress(pairToken1.id),
        Number(pairToken1.decimals),
        axlUSTAddress.toLowerCase() === pairToken1.id.toLowerCase() ? axlUSTToken.symbol : pairToken1.symbol,
        pairToken1.name,
      );

      const tokens = [token0, token1].sort(tokenComparator) as [Token, Token];

      const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
      const lpToken = dummyPair.liquidityToken;

      const poolAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(farm?.allocPoint));

      const totalAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(totalAllocPoint ?? 0));
      const rewardRatePerSecAmount = new TokenAmount(png, JSBI.BigInt(rewardPerSecond ?? 0));
      const poolRewardRate = new TokenAmount(
        png,
        JSBI.divide(JSBI.multiply(poolAllocPointAmount.raw, rewardRatePerSecAmount.raw), totalAllocPointAmount.raw),
      );

      const totalRewardRatePerWeek = new TokenAmount(png, JSBI.multiply(poolRewardRate.raw, BIG_INT_SECONDS_IN_WEEK));

      const periodFinishMs = (rewardsExpiration || 0) * 1000;
      // periodFinish will be 0 immediately after a reward contract is initialized
      const isPeriodFinished =
        periodFinishMs === 0 ? false : periodFinishMs < Date.now() || poolAllocPointAmount.equalTo('0');

      const minichefTvl = parseUnits(farm?.tvl?.toString());
      const totalSupplyReserve0 = parseUnits(farm?.pair?.reserve0.toString());
      const totalSupply = parseUnits(
        farm?.pair?.totalSupply.toString() === '0' ? '1' : farm?.pair?.totalSupply.toString(),
      );
      const token0derivedUSD = parseUnits(Number(farm?.pair?.token0?.derivedUSD)?.toFixed(10));
      const pairTokenValueInUSD = token0derivedUSD.mul(parseUnits('2'));
      const calculatedStakedUsdValue = minichefTvl.mul(totalSupplyReserve0).div(totalSupply);
      // we have 2 10^18, so we need to divide ONE_TOKEN 2 times
      const finalStakedValueInUSD = pairTokenValueInUSD
        .mul(calculatedStakedUsdValue)
        .div(ONE_TOKEN.toString())
        .div(ONE_TOKEN.toString());
      const totalStakedAmount = new TokenAmount(lpToken, minichefTvl.toString() || JSBI.BigInt(0));
      const totalStakedInUsd = new TokenAmount(lpToken, finalStakedValueInUSD.toString() || JSBI.BigInt(0));

      const stakedAmount = new TokenAmount(
        lpToken,
        parseUnits(farm?.farmingPositions?.[0]?.stakedTokenBalance?.toString() ?? '0').toString(),
      );
      const earnedAmount = new TokenAmount(png, JSBI.BigInt(farm?.earnedAmount ?? 0));

      const multiplier = JSBI.BigInt(farm?.allocPoint);

      const reserve0 = parseUnits((pair?.reserve0 ?? 0).toString(), pair?.token0.decimals);
      const reserve0Amount = new TokenAmount(token0, reserve0?.toString() || JSBI.BigInt(0));

      const reserve1 = parseUnits((pair?.reserve1 ?? 0).toString(), pair?.token1.decimals);
      const reserve1Amount = new TokenAmount(token1, reserve1?.toString() || JSBI.BigInt(0));

      const derivedETH0 = Number(pair?.token0?.derivedETH ?? '0').toFixed(4);
      const token0derivedETH = parseUnits(derivedETH0, pair?.token0.decimals);
      const token0derivedETHAmount = new TokenAmount(token0, token0derivedETH?.toString() || JSBI.BigInt(0));

      const derivedETH1 = Number(pair?.token1?.derivedETH ?? '0').toFixed(4);
      const token1derivedETH = parseUnits(derivedETH1, pair?.token1.decimals);
      const token1derivedETHAmount = new TokenAmount(token1, token1derivedETH?.toString() || JSBI.BigInt(0));

      const totalSupplyAmount = new TokenAmount(lpToken, totalSupply?.toString() || JSBI.BigInt(0));

      const totalSupplyInETH = reserve0Amount
        .multiply(token0derivedETHAmount)
        .add(reserve1Amount.multiply(token1derivedETHAmount));

      const _totalStakedInWavax = totalStakedAmount.multiply(totalSupplyInETH).divide(totalSupplyAmount);

      const totalStakedInWavax = new TokenAmount(
        wavax,
        parseUnits(_totalStakedInWavax.equalTo('0') ? '0' : _totalStakedInWavax.toFixed(0), wavax.decimals)?.toString(),
      );

      const pid = farm?.pid;

      const rewardTokens = rewardsAddresses.map((rewardToken: MinichefFarmReward) => {
        const tokenObj = rewardToken.token;
        return new Token(chainId, getAddress(tokenObj.id), tokenObj.decimals, tokenObj.symbol, tokenObj.name);
      });

      const rewardTokensAddress = rewardsAddresses.map((rewardToken: MinichefFarmReward) => {
        const tokenObj = rewardToken.token;
        return getAddress(tokenObj.id);
      });

      const getHypotheticalWeeklyRewardRate = (
        _stakedAmount: TokenAmount,
        _totalStakedAmount: TokenAmount,
        _totalRewardRatePerSecond: TokenAmount,
      ): TokenAmount => {
        return new TokenAmount(
          png,
          JSBI.greaterThan(_totalStakedAmount.raw, JSBI.BigInt(0))
            ? JSBI.divide(
                JSBI.multiply(JSBI.multiply(_totalRewardRatePerSecond.raw, _stakedAmount.raw), BIG_INT_SECONDS_IN_WEEK),
                _totalStakedAmount.raw,
              )
            : JSBI.BigInt(0),
        );
      };

      const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(stakedAmount, totalStakedAmount, poolRewardRate);

      const farmApr = farmsAprs?.[pid] ?? dummyApr;

      memo.push({
        stakingRewardAddress: MINICHEF_ADDRESS[chainId] || '',
        pid,
        tokens,
        multiplier,
        isPeriodFinished,
        periodFinish: undefined,
        totalStakedAmount,
        totalStakedInUsd,
        totalStakedInWavax,
        rewardRatePerWeek: userRewardRatePerWeek,
        totalRewardRatePerSecond: poolRewardRate,
        totalRewardRatePerWeek: totalRewardRatePerWeek,
        getHypotheticalWeeklyRewardRate,
        getExtraTokensWeeklyRewardRate,
        stakedAmount,
        earnedAmount,
        rewardsAddress,
        rewardTokens,
        rewardTokensAddress,
        swapFeeApr: farmApr.swapFeeApr,
        stakingApr: farmApr.stakingApr,
        combinedApr: farmApr.combinedApr,
      });

      return memo;
    }, [] as MinichefStakingInfo[]);
  }, [chainId, png, rewardPerSecond, totalAllocPoint, rewardsExpiration, farms, farmsAprs]);
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export const useDummyMinichefStakingInfosViaSubgraph = () => {
  return [] as MinichefStakingInfo[];
};

/* eslint-enable max-lines */
