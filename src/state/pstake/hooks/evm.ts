/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { CHAINS, ChainId, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { getAddress, parseUnits } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { SubgraphEnum, getSubgraphClient } from 'src/apollo/client';
import { GET_MINICHEF } from 'src/apollo/minichef';
import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_TWO, BIG_INT_ZERO, ONE_TOKEN, ZERO_ADDRESS } from 'src/constants';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { PANGOLIN_PAIR_INTERFACE } from 'src/constants/abis/pangolinPair';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import { MINICHEF_ADDRESS } from 'src/constants/address';
import { DAIe, PNG, USDC, USDCe, USDTe } from 'src/constants/tokens';
import { PairState, usePair, usePairsContract } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useTokensContract } from 'src/hooks/tokens/evm';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice/evm';
import { useMiniChefContract } from '../../../hooks/useContract';
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../../pmulticall/hooks';
import { DoubleSideStaking, MinichefFarmReward, MinichefStakingInfo, MinichefV2 } from '../types';
import {
  AprResult,
  calculateTotalStakedAmountInAvax,
  calculateTotalStakedAmountInAvaxFromPng,
  fetchChunkedAprs,
  getExtraTokensWeeklyRewardRate,
  tokenComparator,
} from '../utils';
import { useGetExtraPendingRewards, useMinichefPools } from './common';

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

  const tokens0 = useTokensContract(tokens0Adrr);
  const tokens1 = useTokensContract(tokens1Adrr);

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
  const pairs = usePairsContract(_tokens);
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

  const extraPendingTokensRewardsState = useGetExtraPendingRewards(rewardsAddresses, pendingRewards);

  return useMemo(() => {
    if (!chainId || !PNG[chainId]) return [];

    return pairAddresses.reduce<any[]>((memo, _pairAddress, index) => {
      const pairTotalSupplyState = pairTotalSupplies[index];
      const balanceState = balances[index];
      const poolInfo = poolInfos[index];
      const userPoolInfo = userInfos[index];
      const [pairState, pair] = pairs[index];
      const pendingRewardInfo = pendingRewards[index];
      const rewardTokensMultiplier = rewardTokensMultipliers[index];
      const rewardsAddress = rewardsAddresses[index];
      const extraPendingTokensRewardState = extraPendingTokensRewardsState[index];
      const extraPendingTokensRewards = extraPendingTokensRewardState?.result as
        | { amounts: BigNumber[]; tokens: string[] }
        | undefined;

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
        extraPendingTokensRewardState?.loading === false
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

        const tokens = [token0, token1].sort(tokenComparator) as [Token, Token];

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

        const { rewardTokensAddress, extraPendingRewards } = (extraPendingTokensRewards?.amounts ?? []).reduce(
          (memo, rewardAmount: BigNumber, index) => {
            memo.rewardTokensAddress.push(extraPendingTokensRewards?.tokens?.[index] ?? '');
            memo.extraPendingRewards.push(rewardAmount.toString());
            return memo;
          },
          {
            rewardTokensAddress: [] as string[],
            extraPendingRewards: [] as string[],
          },
        );

        memo.push({
          pid,
          stakingRewardAddress: MINICHEF_ADDRESS[chainId] ?? '',
          tokens,
          earnedAmount,
          rewardRatePerWeek: userRewardRatePerWeek,
          totalRewardRatePerSecond: poolRewardRate,
          totalRewardRatePerWeek: totalRewardRatePerWeek,
          stakedAmount,
          totalStakedAmount,
          totalStakedInWavax,
          totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDC[chainId], '0'),
          multiplier,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          isPeriodFinished,
          getHypotheticalWeeklyRewardRate,
          getExtraTokensWeeklyRewardRate,
          rewardTokensAddress: rewardTokensAddress,
          rewardTokensMultiplier: [BigNumber.from(1), ...(rewardTokensMultiplier?.result?.[0] || [])],
          rewardsAddress,
          swapFeeApr: farmApr.swapFeeApr,
          stakingApr: farmApr.stakingApr,
          combinedApr: farmApr.combinedApr,
          extraPendingRewards,
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
    extraPendingTokensRewardsState,
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
  const { account } = usePangolinWeb3();
  const minichefContract = useMiniChefContract();
  const results = useMiniChefSubgraphData();

  const minichefData = results?.data?.[0];

  const farms = useMemo(() => {
    if (!minichefData?.farms?.length) return [];

    return minichefData?.farms;
  }, [minichefData, results?.isLoading, results?.isError]);

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

  const userInfoInput = useMemo(() => {
    if (pids.length === 0 || !account) return [];
    return pids.map((pid) => [pid, account]);
  }, [pids, account]); // [[pid, account], ...] [[0, account], [1, account], [2, account] ...]

  // get the user pending rewards for each pool
  const userPendingRewardsState = useSingleContractMultipleData(
    minichefContract,
    'pendingReward',
    userInfoInput ? userInfoInput : [],
  );

  const rewardsAddresses = useMemo(() => {
    const _rewardsAddresses: (string | undefined)[] = [];
    for (let index = 0; index < farms.length; index++) {
      const farm = farms[index];
      const rewarderAddress = farm.rewarder.id.split('-')[0];
      _rewardsAddresses.push(rewarderAddress !== ZERO_ADDRESS ? rewarderAddress : undefined);
    }
    return _rewardsAddresses;
  }, [farms]);

  const extraPendingTokensRewardsState = useGetExtraPendingRewards(rewardsAddresses, userPendingRewardsState);

  return useMemo(() => {
    if (!chainId || !png || !farms?.length) return [];

    const _farms: MinichefStakingInfo[] = [];
    for (let index = 0; index < farms.length; index++) {
      const farm = farms[index];
      const extraPendingTokensRewardState = extraPendingTokensRewardsState[index];
      const extraPendingTokensRewards = extraPendingTokensRewardState?.result as
        | { amounts: BigNumber[]; tokens: string[] }
        | undefined;

      const userPendingRewardState = userPendingRewardsState[index];
      const rewardsAddress = farm?.rewarderAddress;

      // if is loading or not exist pair continue
      if (extraPendingTokensRewardState?.loading || userPendingRewardState?.loading) {
        continue;
      }

      const pair = farm.pair;

      const pairToken0 = pair?.token0;

      const token0 = new Token(
        chainId,
        getAddress(pairToken0.id),
        Number(pairToken0.decimals),
        pairToken0.symbol,
        pairToken0.name,
      );

      const pairToken1 = pair?.token1;
      const token1 = new Token(
        chainId,
        getAddress(pairToken1.id),
        Number(pairToken1.decimals),
        pairToken1.symbol,
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
      const earnedAmount = new TokenAmount(
        png,
        JSBI.BigInt(userPendingRewardState?.result?.['pending']?.toString() ?? 0),
      );

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

      const rewards = farm.rewarder.rewards;
      const { rewardTokensAddress, rewardTokens, rewardMultipliers, extraPendingRewards } = (
        extraPendingTokensRewards?.amounts ?? []
      ).reduce(
        (memo, rewardAmount, index) => {
          const address: string = extraPendingTokensRewards?.tokens?.[index] ?? '';
          // we need to use find because subgraph don't return in the same order of contract
          // eg: contract return [token0, token1], subgraph return [token1, token0]
          const rewardToken = rewards.find((reward) => reward.token.id === address.toLowerCase()) as MinichefFarmReward; // we can do this because have same tokens
          const _token = new Token(
            chainId,
            address,
            Number(rewardToken.token.decimals),
            rewardToken.token.symbol,
            rewardToken.token.name,
          );
          const _multiplier = JSBI.BigInt(rewardToken?.multiplier.toString());

          // remove png from rewards
          if (_token.equals(png)) {
            return memo;
          }

          memo.rewardTokensAddress.push(address);
          memo.rewardTokens.push(_token);
          memo.rewardMultipliers.push(_multiplier);
          memo.extraPendingRewards.push(rewardAmount.toString());
          return memo;
        },
        {
          rewardTokensAddress: [] as string[],
          rewardTokens: [] as Token[],
          rewardMultipliers: [] as JSBI[],
          extraPendingRewards: [] as string[],
        },
      );

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

      _farms.push({
        stakingRewardAddress: MINICHEF_ADDRESS[chainId] ?? '',
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
        rewardTokensMultiplier: rewardMultipliers,
        swapFeeApr: farmApr.swapFeeApr,
        stakingApr: farmApr.stakingApr,
        combinedApr: farmApr.combinedApr,
        extraPendingRewards,
      });
    }

    return _farms;
  }, [chainId, png, rewardPerSecond, totalAllocPoint, rewardsExpiration, farms, farmsAprs, userPendingRewardsState]);
};

/* eslint-enable max-lines */
