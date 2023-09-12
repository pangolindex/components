/* eslint-disable max-lines */
import { parseUnits } from '@ethersproject/units';
import { Fraction, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import {
  BIGNUMBER_ZERO,
  BIG_INT_SECONDS_IN_WEEK,
  BIG_INT_ZERO,
  PNG,
  PairState,
  PangochefFarmReward,
  USDC,
  ZERO_ADDRESS,
  calculateUserRewardRate,
  useChainId,
  useLastBlockTimestampHook,
  usePangolinWeb3,
  useSubgraphFarms,
} from '@honeycomb/shared';
import { usePair, useSingleContractMultipleData } from '@honeycomb/state-hooks';
import { BigNumber } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useGetExtraPendingRewards } from 'src/hooks/minichef/hooks/common';
import { getExtraTokensWeeklyRewardRate } from 'src/hooks/minichef/utils';
import { usePangoChefContract } from 'src/hooks/useContract';
import { PangoChefInfo, UserInfo, ValueVariables } from '../types';
import { calculateUserAPR } from '../utils';
import { useHederaPangochefContractCreateCallback } from './common';

export function useGetPangoChefInfosViaSubgraph() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const png = PNG[chainId];
  const [shouldCreateStorage] = useHederaPangochefContractCreateCallback();
  const pangoChefContract = usePangoChefContract();

  const useGetBlockTimestamp = useLastBlockTimestampHook[chainId];
  const blockTime = useGetBlockTimestamp();

  const results = useSubgraphFarms();
  const pangoChefData = results?.data?.[0];

  const wavax = WAVAX[chainId];
  const [avaxPngPairState, avaxPngPair] = usePair(wavax, png);

  const allFarms = useMemo(() => {
    if (!chainId || !png || !pangoChefData?.farms?.length) return [];

    const farms = pangoChefData?.farms?.filter((farm) => !!farm?.pair);

    return farms;
  }, [chainId, png, results?.data, results?.isLoading, results?.isError]);

  const allPoolsIds = useMemo(() => {
    if ((allFarms || []).length === 0) return [];
    return allFarms.map((item) => [item?.pid]);
  }, [allFarms]);

  const totalPangochefRewardRate = pangoChefData?.rewardRate;
  const totalPangochefWeight = pangoChefData?.totalWeight;

  const userInfoInput = useMemo(() => {
    if ((allPoolsIds || []).length === 0 || !account) return [];
    return allPoolsIds.map((pid) => [pid[0], account]);
  }, [allPoolsIds, account]); // [[pid, account], ...] [[0, account], [1, account], [2, account] ...]

  // let's just call getUser only when the user has a staked value so
  // that we can access the lockCount of the user's pool
  const isUserStaked = useMemo(
    () =>
      allFarms.some(
        (farm) =>
          farm.farmingPositions.length > 0 &&
          farm.farmingPositions.some((farmPosition) => Number(farmPosition.stakedTokenBalance) > 0),
      ),
    [allFarms],
  );

  const useInfoCallOptions = useMemo(() => ({ blocksPerFetch: 20 }), []);
  // TODO: implement flag sistem to us can enable disable this more easy
  // we are using this for force to use the on chain data when the subgraph are broken
  const FETCH_ON_CHAIN_PANGOCHEF_USER_INFO = true;

  const userInfosState = useSingleContractMultipleData(
    pangoChefContract,
    'getUser',
    (!shouldCreateStorage && isUserStaked) || FETCH_ON_CHAIN_PANGOCHEF_USER_INFO ? userInfoInput : [],
    useInfoCallOptions,
  );

  // format the data to UserInfo type
  const userInfos = useMemo(() => {
    return userInfosState.map((callState) => {
      const result = callState?.result?.[0];
      if (!result || callState.loading) {
        return {
          valueVariables: {
            balance: BigNumber.from(0),
            sumOfEntryTimes: BigNumber.from(0),
          },
          lockCount: undefined,
        } as UserInfo;
      }

      const valueVariables = result.valueVariables as ValueVariables;
      const previousValues = result.previousValues;

      if (!valueVariables || !previousValues) {
        return {
          valueVariables: {
            balance: BigNumber.from(0),
            sumOfEntryTimes: BigNumber.from(0),
          },
          lockCount: undefined,
        } as UserInfo;
      }

      return {
        valueVariables: {
          balance: valueVariables?.balance,
          sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
        } as ValueVariables,
        previousValues: previousValues,
        lockCount: result.lockCount,
      } as UserInfo;
    });
  }, [userInfosState]);

  // get the user pending rewards for each pool
  const userPendingRewardsState = useSingleContractMultipleData(
    pangoChefContract,
    'userPendingRewards',
    !shouldCreateStorage && userInfoInput ? userInfoInput : [],
  );

  const rewardsAddresses = useMemo(() => {
    const _rewardsAddresses: (string | undefined)[] = [];
    for (let index = 0; index < allFarms.length; index++) {
      const farm = allFarms[index];
      const rewarderAddress = farm.rewarder.id.split('-')[0];
      _rewardsAddresses.push(rewarderAddress !== ZERO_ADDRESS ? rewarderAddress : undefined);
    }
    return _rewardsAddresses;
  }, [allFarms]);

  const extraPendingTokensRewardsState = useGetExtraPendingRewards(rewardsAddresses, userPendingRewardsState);

  return useMemo(() => {
    if (!chainId || !png || !allFarms?.length) return [];

    const farms: PangoChefInfo[] = [];
    for (let index = 0; index < allPoolsIds.length; index++) {
      const farm = allFarms[index];

      const userPendingRewardState = userPendingRewardsState[index];
      const userInfo = userInfos[index];
      const extraPendingTokensRewardState = extraPendingTokensRewardsState[index];
      const extraPendingTokensRewards = extraPendingTokensRewardState?.result as
        | { amounts: BigNumber[]; tokens: string[] }
        | undefined;

      // if is loading or not exist pair continue
      if (
        !farm.pair || // skip pull with pair null because it is relayer
        extraPendingTokensRewardState?.loading ||
        userPendingRewardState?.loading ||
        avaxPngPairState == PairState.LOADING ||
        !avaxPngPair
      ) {
        continue;
      }

      const rewards = farm.rewarder.rewards;

      const pid = farm?.pid;
      const pair = farm?.pair;
      const multiplier = JSBI.BigInt(farm?.weight);

      const { rewardTokensAddress, rewardTokens, rewardMultipliers, extraPendingRewards } = (
        extraPendingTokensRewards?.amounts ?? []
      ).reduce(
        (memo, rewardAmount, index) => {
          const address: string = extraPendingTokensRewards?.tokens?.[index] ?? '';
          // we need to use find because subgraph don't return in the same order of contract
          // eg: contract return [token0, token1], subgraph return [token1, token0]
          const rewardToken = rewards.find(
            (reward) => reward.token.id === address.toLowerCase(),
          ) as PangochefFarmReward; // we can do this because have same tokens
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
          memo.extraPendingRewards.push(JSBI.BigInt(rewardAmount.toString()));
          return memo;
        },
        {
          rewardTokensAddress: [] as string[],
          rewardTokens: [] as Token[],
          rewardMultipliers: [] as JSBI[],
          extraPendingRewards: [] as JSBI[],
        },
      );

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

      const tokens = [token0, token1] as [Token, Token];
      const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
      const lpToken = dummyPair.liquidityToken;

      const farmTvl = farm?.tvl ?? '0';
      const _farmTvl = Number(farmTvl) <= 0 ? '0' : farmTvl;
      const farmTvlAmount = new TokenAmount(lpToken, _farmTvl || JSBI.BigInt(0));

      const reserve0 = parseUnits(pair?.reserve0 ?? '0', pair?.token0.decimals);

      const reserve0Amount = new TokenAmount(token0, reserve0?.toString() || JSBI.BigInt(0));

      const reserve1 = parseUnits(pair?.reserve1 ?? '0', pair?.token1.decimals);

      const reserve1Amount = new TokenAmount(token1, reserve1?.toString() || JSBI.BigInt(0));

      const token0derivedUSD = parseUnits(Number(pair?.token0?.derivedUSD)?.toFixed(4), pair?.token0.decimals);

      const token1derivedUSD = parseUnits(Number(pair?.token1?.derivedUSD)?.toFixed(4), pair?.token1.decimals);

      const token0derivedUSDAmount = new TokenAmount(token0, token0derivedUSD?.toString() || JSBI.BigInt(0));

      const token1derivedUSDAmount = new TokenAmount(token1, token1derivedUSD?.toString() || JSBI.BigInt(0));

      const totalSupply = pair?.totalSupply;

      const totalSupplyAmount = new TokenAmount(lpToken, totalSupply?.toString() || JSBI.BigInt(0));

      const totalSupplyInUsd = reserve0Amount
        .multiply(token0derivedUSDAmount)
        .add(reserve1Amount.multiply(token1derivedUSDAmount));

      const finalStakedValueInUSD = farmTvlAmount.multiply(totalSupplyInUsd).divide(totalSupplyAmount);

      const totalStakedInUsd = new TokenAmount(
        USDC[chainId],

        parseUnits(
          finalStakedValueInUSD.equalTo('0') ? '0' : finalStakedValueInUSD.toFixed(0),
          USDC[chainId].decimals,
        )?.toString(),
      );
      const totalStakedAmount = new TokenAmount(lpToken, _farmTvl?.toString() || JSBI.BigInt(0));

      const _subgraphStakedAmount: string | undefined = farm?.farmingPositions?.[0]?.stakedTokenBalance;
      const subgraphStakedAmount =
        !!_subgraphStakedAmount && Number(_subgraphStakedAmount) >= 0 ? _subgraphStakedAmount : '0';

      const onchainStakedAmount: BigNumber | undefined = userInfo?.valueVariables?.balance;

      //let's prioritize the onchain data but if you don't have it, let's use the subgraph if you have it
      const _userStakedAmount =
        !!onchainStakedAmount && onchainStakedAmount.gt(0) ? onchainStakedAmount.toString() : subgraphStakedAmount;
      const userTotalStakedAmount = new TokenAmount(lpToken, JSBI.BigInt(_userStakedAmount));

      const pendingRewards = new TokenAmount(png, JSBI.BigInt(userPendingRewardState?.result?.[0] ?? 0));

      const token0derivedETH = parseUnits(Number(pair?.token0?.derivedETH)?.toFixed(4), pair?.token0.decimals);

      const token1derivedETH = parseUnits(Number(pair?.token1?.derivedETH)?.toFixed(4), pair?.token1.decimals);

      const token0derivedETHAmount = new TokenAmount(token0, token0derivedETH?.toString() || JSBI.BigInt(0));

      const token1derivedETHAmount = new TokenAmount(token1, token1derivedETH?.toString() || JSBI.BigInt(0));

      const totalSupplyInETH = reserve0Amount
        .multiply(token0derivedETHAmount)
        .add(reserve1Amount.multiply(token1derivedETHAmount));

      const _totalStakedInWavax = farmTvlAmount.multiply(totalSupplyInETH).divide(totalSupplyAmount);

      const totalStakedInWavax = new TokenAmount(
        wavax,
        parseUnits(_totalStakedInWavax.equalTo('0') ? '0' : _totalStakedInWavax.toFixed(0), wavax.decimals)?.toString(),
      );

      // totalPangochefRewardRate -> total png reward per second
      // totalPangochefWeight -> total weight of all farms (ralayer too)
      // farm?.weight -> weight of this farm
      // rewardRate = (farm?.weight * totalPangochefRewardRate) / totalPangochefWeight
      const rewardRate: BigNumber =
        farm?.weight === '0' || !totalPangochefWeight || totalPangochefWeight === '0'
          ? BigNumber.from(0)
          : BigNumber.from(totalPangochefRewardRate ?? 0)
              .mul(farm?.weight)
              .div(totalPangochefWeight);
      const pngPrice = avaxPngPair.priceOf(png, wavax);

      const pairPriceInEth = totalSupplyInETH.divide(totalSupplyAmount);

      const exponent = png.decimals - lpToken.decimals;

      // poolAPR = poolRewardRate(POOL_ID) * 365 days * 100 * PNG_PRICE / ((pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE) * 1e(png.decimals-lptoken.decimals))
      const apr =
        _farmTvl === '0' || pairPriceInEth?.equalTo('0') || !pairPriceInEth
          ? 0
          : Number(
              pngPrice?.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .divide(pairPriceInEth?.multiply(_farmTvl))
                // here apr is in 10^(png.decimals - lpToken.decimals) so we needed to divide by 10^(png.decimals - lpToken.decimals) to keep it in simple form
                .divide(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(exponent)))
                .toSignificant(2),
            );

      const totalRewardRatePerSecond = new TokenAmount(png, rewardRate.toString());
      const totalRewardRatePerWeek = new TokenAmount(
        png,
        JSBI.multiply(totalRewardRatePerSecond?.raw, BIG_INT_SECONDS_IN_WEEK),
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

      const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(
        userTotalStakedAmount,
        totalStakedAmount,
        totalRewardRatePerSecond,
      );

      const farmSumOfEntryTimes =
        Number(farm.sumOfEntryTimes) < 0 ? BIGNUMBER_ZERO : BigNumber.from(farm.sumOfEntryTimes);

      const poolValueVariables = {
        balance: BigNumber.from(_farmTvl),
        sumOfEntryTimes: farmSumOfEntryTimes,
      };

      const _subgraphUserSumOfEntry: string | undefined = farm?.farmingPositions?.[0]?.sumOfEntryTimes;
      const subgraphUserSumOfEntry: BigNumber =
        !!_subgraphUserSumOfEntry && Number(_subgraphUserSumOfEntry) >= 0
          ? BigNumber.from(_subgraphUserSumOfEntry)
          : BIGNUMBER_ZERO;

      const onchainSumOfEntry: BigNumber | undefined = userInfo?.valueVariables?.sumOfEntryTimes;

      // let's prioritize the onchain data because they are more accurate, but if not, let's use from subgraph
      const userValueVariables = {
        balance: BigNumber.from(_userStakedAmount),
        sumOfEntryTimes: onchainSumOfEntry && onchainSumOfEntry.gt(0) ? onchainSumOfEntry : subgraphUserSumOfEntry,
      };

      const _userRewardRate = calculateUserRewardRate(userValueVariables, poolValueVariables, rewardRate, blockTime);

      const userRewardRate = new Fraction(_userRewardRate.toString(), '1');

      const userApr = calculateUserAPR({
        pngPrice,
        png,
        userRewardRate,
        stakedAmount: userTotalStakedAmount,
        pairPrice: pairPriceInEth,
      });

      farms.push({
        pid: pid,
        tokens,
        stakingRewardAddress: pangoChefContract?.address ?? '',
        totalStakedAmount: totalStakedAmount,
        totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDC[chainId], BIG_INT_ZERO),
        stakedAmount: userTotalStakedAmount,
        periodFinish: undefined,
        multiplier,
        rewardTokens,
        rewardTokensAddress,
        rewardTokensMultiplier: rewardMultipliers,
        totalStakedInWavax: totalStakedInWavax,
        isPeriodFinished: rewardRate.isZero(),
        rewardsAddress: farm.rewarder.id.split('-')[0],
        totalRewardRatePerSecond: totalRewardRatePerSecond,
        totalRewardRatePerWeek: totalRewardRatePerWeek,
        rewardRatePerWeek: userRewardRatePerWeek,
        getHypotheticalWeeklyRewardRate: getHypotheticalWeeklyRewardRate,
        getExtraTokensWeeklyRewardRate: getExtraTokensWeeklyRewardRate,
        earnedAmount: pendingRewards,
        valueVariables: poolValueVariables,
        userValueVariables: userValueVariables,
        lockCount: userInfo?.lockCount,
        userRewardRate: userRewardRate,
        stakingApr: apr,
        pairPrice: pairPriceInEth,
        poolRewardRate: new Fraction(rewardRate.toString()),
        userApr: userApr,
        extraPendingRewards: extraPendingRewards,
      });
    }

    return farms;
  }, [
    chainId,
    png,
    totalPangochefRewardRate,
    totalPangochefWeight,
    userPendingRewardsState,
    allFarms,
    userInfosState,
    allPoolsIds,
    blockTime,
    extraPendingTokensRewardsState,
  ]);
}
/* eslint-enable max-lines */
