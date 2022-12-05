/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { JSBI, Pair, Price, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_ZERO, ZERO_ADDRESS } from 'src/constants';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { PANGOLIN_PAIR_INTERFACE } from 'src/constants/abis/pangolinPair';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import { PNG, USDC } from 'src/constants/tokens';
import { PairState, usePair, usePairs } from 'src/data/Reserves';
import { useChainId, useGetBlockTimestamp, usePangolinWeb3 } from 'src/hooks';
import { useCoinGeckoCurrencyPrice, useTokens } from 'src/hooks/Tokens';
import { usePangoChefContract } from 'src/hooks/useContract';
import { usePairsCurrencyPrice, useTokensCurrencyPrice } from 'src/hooks/useCurrencyPrice';
import { decimalToFraction } from 'src/utils';
import { useMultipleContractSingleData, useSingleCallResult, useSingleContractMultipleData } from '../pmulticall/hooks';
import { getExtraTokensWeeklyRewardRate } from '../pstake/hooks';
import { PangoChefInfo, Pool, PoolType, RewardSummations, UserInfo, ValueVariables } from './types';

export function usePangoChefInfos() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();

  const png = PNG[chainId];

  // get the length of pools
  const poolLenght: BigNumber | undefined = useSingleCallResult(pangoChefContract, 'poolsLength').result?.[0];
  // create array with length of pools
  const allPoolsIds = new Array(Number(poolLenght ? poolLenght.toString() : 0))
    .fill(0)
    .map((_, index) => [index.toString()]);

  const poolsState = useSingleContractMultipleData(pangoChefContract, 'pools', allPoolsIds);
  // format the data to Pool type
  const [pools, poolsIds] = useMemo(() => {
    const _pools: Pool[] = [];
    const _poolsIds: string[][] = [];

    for (let i = 0; i < poolsState.length; i++) {
      const result = poolsState[i]?.result;
      if (!result) {
        continue;
      }

      const tokenOrRecipient = result.tokenOrRecipient;
      const poolType = result.poolType as PoolType;
      const rewarder = result.rewarder;
      const rewardPair = result.rewardPair;
      const valueVariables = result.valueVariables as ValueVariables;
      const rewardSummations = result.rewardSummationsStored as RewardSummations;

      if (!tokenOrRecipient || !poolType || !rewarder || !rewardPair || !valueVariables || !rewardSummations) {
        continue;
      }

      // remove not erc20 pool and remove this pool from poolsIds
      if (poolType !== PoolType.ERC20_POOL) {
        continue;
      }

      _pools.push({
        tokenOrRecipient: tokenOrRecipient,
        poolType: poolType,
        rewarder: rewarder,
        rewardPair: rewardPair,
        valueVariables: {
          balance: valueVariables?.balance,
          sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
        } as ValueVariables,
        rewardSummations: rewardSummations,
      } as Pool);

      _poolsIds.push([i.toString()]);
    }

    return [_pools, _poolsIds];
  }, [poolsState]);

  // get reward rates for each pool
  const poolsRewardsRateState = useSingleContractMultipleData(pangoChefContract, 'poolRewardRate', poolsIds);

  // get the address of the rewarder for each pool
  const rewardsAddresses = useMemo(() => {
    if ((pools || []).length === 0) return [];
    return pools.map((pool) => {
      if (!!pool?.rewarder && pool?.rewarder !== ZERO_ADDRESS) {
        return pool.rewarder;
      }
      return undefined;
    });
  }, [pools]);

  const rewardsTokensState = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardTokens',
    [],
  );

  const rewardsMultipliersState = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardMultipliers',
    [],
  );

  // get the address of lp tokens for each pool
  const lpTokens = useMemo(() => {
    if ((pools || []).length === 0) return [];
    return pools.map((pool) => pool?.tokenOrRecipient);
  }, [pools]);

  // get the tokens for each pool
  const tokens0State = useMultipleContractSingleData(lpTokens, PANGOLIN_PAIR_INTERFACE, 'token0', []);
  const tokens1State = useMultipleContractSingleData(lpTokens, PANGOLIN_PAIR_INTERFACE, 'token1', []);

  const tokens0Adrr = useMemo(() => {
    return tokens0State.map((result) => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [tokens0State]);

  const tokens1Adrr = useMemo(() => {
    return tokens1State.map((result) => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [tokens1State]);

  const tokens0 = useTokens(tokens0Adrr);
  const tokens1 = useTokens(tokens1Adrr);

  const tokensPairs = useMemo(() => {
    if (tokens0 && tokens1 && tokens0?.length === tokens1?.length) {
      const tokens: [Token | undefined, Token | undefined][] = [];
      tokens0.forEach((token0, index) => {
        const token1 = tokens1[index];
        if (token0 && token1) {
          tokens.push([token0, token1]);
        }
      });
      return tokens;
    }
    return [] as [Token | undefined, Token | undefined][];
  }, [tokens0, tokens1]);

  // get the pairs for each pool
  const pairs = usePairs(tokensPairs);

  const pairAddresses = useMemo(() => {
    return pairs.map(([, pair]) => pair?.liquidityToken?.address);
  }, [pairs]);

  const pairTotalSuppliesState = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');

  const userInfoInput = useMemo(() => {
    if (poolsIds.length === 0 || !account) return [];
    return poolsIds.map((pid) => [pid[0], account]);
  }, [poolsIds, account]); // [[pid, account], ...] [[0, account], [1, account], [2, account] ...]

  const userInfosState = useSingleContractMultipleData(pangoChefContract, 'getUser', userInfoInput ?? []);

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
          isLockingPoolZero: false,
        } as UserInfo;
      }

      const valueVariables = result.valueVariables as ValueVariables;
      const rewardSummations = result.rewardSummationsPaid as RewardSummations;
      const previousValues = result.previousValues;
      const isLockingPoolZero = result.isLockingPoolZero ?? false;

      if (!valueVariables || !rewardSummations || !previousValues) {
        return {
          valueVariables: {
            balance: BigNumber.from(0),
            sumOfEntryTimes: BigNumber.from(0),
          },
          isLockingPoolZero: false,
        } as UserInfo;
      }

      return {
        valueVariables: {
          balance: valueVariables?.balance,
          sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
        } as ValueVariables,
        rewardSummations: rewardSummations,
        previousValues: previousValues,
        isLockingPoolZero: isLockingPoolZero,
      } as UserInfo;
    });
  }, [userInfosState]);

  // get the user pending rewards for each pool
  const userPendingRewardsState = useSingleContractMultipleData(
    pangoChefContract,
    'userPendingRewards',
    userInfoInput ?? [],
  );

  const userRewardRatesState = useSingleContractMultipleData(pangoChefContract, 'userRewardRate', userInfoInput ?? []);

  const wavax = WAVAX[chainId];
  const [avaxPngPairState, avaxPngPair] = usePair(wavax, png);

  const pairsToGetPrice = useMemo(() => {
    const _pairs: { pair: Pair; totalSupply: TokenAmount }[] = [];
    pairs.forEach(([, pair], index) => {
      const pairTotalSupplyState = pairTotalSuppliesState[index];
      if (pair && pairTotalSupplyState.result) {
        _pairs.push({
          pair: pair,
          totalSupply: new TokenAmount(pair.liquidityToken, JSBI.BigInt(pairTotalSupplyState?.result?.[0])),
        });
      }
    });
    return _pairs;
  }, [pairs, pairTotalSuppliesState]);

  const pairPrices = usePairsCurrencyPrice(pairsToGetPrice);

  const { data: currencyPrice = 0 } = useCoinGeckoCurrencyPrice(chainId);

  return useMemo(() => {
    if (!chainId || !png || pairs.length == 0) return [] as PangoChefInfo[];

    const farms: PangoChefInfo[] = [];
    for (let index = 0; index < poolsIds.length; index++) {
      const poolState = poolsState[index];
      const poolRewardRateState = poolsRewardsRateState[index];
      const userInfoState = userInfosState[index];
      const token0State = tokens0State[index];
      const token1State = tokens1State[index];
      const rewardTokensState = rewardsTokensState[index];
      const rewardMultipliersState = rewardsMultipliersState[index];
      const userPendingRewardState = userPendingRewardsState[index];
      const pairTotalSupplyState = pairTotalSuppliesState[index];
      const userRewardRateState = userRewardRatesState[index];
      const [pairState, pair] = pairs[index];

      // if is loading or not exist pair continue
      if (
        poolState.loading ||
        poolRewardRateState.loading ||
        userInfoState.loading ||
        token0State.loading ||
        token1State.loading ||
        rewardTokensState.loading ||
        rewardMultipliersState.loading ||
        userPendingRewardState.loading ||
        userRewardRateState.loading ||
        pairTotalSupplyState.loading ||
        pairState === PairState.LOADING ||
        avaxPngPairState == PairState.LOADING ||
        !pair ||
        !avaxPngPair
      ) {
        continue;
      }

      const pid = poolsIds[index][0];
      const pool = pools[index];
      const rewardRate: BigNumber = poolRewardRateState.result?.[0] ?? BigNumber.from(0);
      const totalStakedAmount = new TokenAmount(
        pair.liquidityToken,
        JSBI.BigInt(pool.valueVariables.balance.toString()),
      );

      const userInfo = userInfos[index];
      const userTotalStakedAmount = new TokenAmount(
        pair.liquidityToken,
        JSBI.BigInt(userInfo?.valueVariables.balance ?? 0),
      );

      const pendingRewards = new TokenAmount(png, JSBI.BigInt(userPendingRewardState?.result?.[0] ?? 0));

      const pairPrice = pairPrices[pair.liquidityToken.address];
      const pngPrice = avaxPngPair.priceOf(png, wavax);
      const _totalStakedInWavax = pairPrice.raw.multiply(totalStakedAmount.raw);
      const currencyPriceFraction = decimalToFraction(currencyPrice);

      // calculate the total staked amount in usd
      const totalStakedInUsd = new TokenAmount(
        USDC[chainId],
        currencyPriceFraction.multiply(_totalStakedInWavax).toFixed(0),
      );
      const totalStakedInWavax = new TokenAmount(wavax, _totalStakedInWavax.toFixed(0));

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
      // poolAPR = poolRewardRate(POOL_ID) * 365 days * 100 * PNG_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      const apr =
        pool.valueVariables.balance.isZero() || pairPrice.equalTo('0')
          ? 0
          : Number(
              pngPrice.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .divide(pairPrice.raw.multiply(pool.valueVariables.balance.toString()))
                .toSignificant(2),
            );

      const totalRewardRatePerSecond = new TokenAmount(png, rewardRate.toString());
      const totalRewardRatePerWeek = new TokenAmount(
        png,
        JSBI.multiply(totalRewardRatePerSecond.raw, BIG_INT_SECONDS_IN_WEEK),
      );

      const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(
        userTotalStakedAmount,
        totalStakedAmount,
        totalRewardRatePerSecond,
      );

      const rewardMultipliers: JSBI[] = rewardMultipliersState?.result?.[0].map((value: BigNumber) => {
        return JSBI.BigInt(value.toString());
      });

      farms.push({
        pid: pid,
        tokens: [pair.token0, pair.token1],
        stakingRewardAddress: pangoChefContract?.address,
        totalStakedAmount: totalStakedAmount,
        totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDC[chainId], BIG_INT_ZERO),
        totalStakedInWavax: totalStakedInWavax,
        multiplier: BIG_INT_ZERO,
        stakedAmount: userTotalStakedAmount,
        isPeriodFinished: rewardRate.isZero(),
        periodFinish: undefined,
        rewardsAddress: pool.rewarder,
        rewardTokensAddress: [png.address, ...(rewardTokensState?.result?.[0] || [])],
        rewardTokensMultiplier: rewardMultipliers,
        totalRewardRatePerSecond: totalRewardRatePerSecond,
        totalRewardRatePerWeek: totalRewardRatePerWeek,
        rewardRatePerWeek: userRewardRatePerWeek,
        getHypotheticalWeeklyRewardRate: getHypotheticalWeeklyRewardRate,
        getExtraTokensWeeklyRewardRate: getExtraTokensWeeklyRewardRate,
        earnedAmount: pendingRewards,
        valueVariables: pool.valueVariables,
        userValueVariables: userInfo?.valueVariables,
        isLockingPoolZero: userInfo.isLockingPoolZero,
        userRewardRate: userRewardRateState.result?.[0] ?? BigNumber.from(0),
        stakingApr: apr,
        pairPrice: pairPrice,
        poolType: pool.poolType,
        poolRewardRate: rewardRate,
      } as PangoChefInfo);
    }
    return farms;
  }, [
    poolsIds,
    poolsState,
    poolsRewardsRateState,
    userInfosState,
    tokens0State,
    tokens1State,
    rewardsTokensState,
    pairTotalSuppliesState,
    userPendingRewardsState,
    pairs,
  ]);
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function useDummyPangoChefInfos() {
  return [] as PangoChefInfo[];
}

export function useUserPangoChefAPR(stakingInfo?: PangoChefInfo) {
  const blockTime = useGetBlockTimestamp();

  return useMemo(() => {
    if (!stakingInfo) return '0';

    const userBalance = stakingInfo?.userValueVariables.balance;
    const userSumOfEntryTimes = stakingInfo?.userValueVariables.sumOfEntryTimes;

    const poolBalance = stakingInfo?.valueVariables.balance;
    const poolSumOfEntryTimes = stakingInfo?.valueVariables.sumOfEntryTimes;

    if (userBalance.isZero() || poolBalance.isZero() || !blockTime) return '0';
    const blockTimestamp = BigNumber.from(blockTime.toString());

    //userAPR = poolAPR * (blockTime - (userValueVariables.sumOfEntryTimes / userValueVariables.balance)) / (blockTime - (poolValueVariables.sumOfEntryTimes / poolValueVariables.balance))
    const a = userSumOfEntryTimes.div(userBalance.isZero() ? BigNumber.from(1) : userBalance);
    const b = poolSumOfEntryTimes.div(poolBalance.isZero() ? BigNumber.from(1) : poolBalance);
    const c = blockTimestamp.sub(a);
    const d = blockTimestamp.sub(b);
    return c.lte(0) || d.lte(0)
      ? '0'
      : BigNumber.from(Math.floor(stakingInfo.stakingApr ?? 0))
          .mul(c)
          .div(d)
          .toString();
  }, [blockTime, stakingInfo]);
}

export function useUserPangoChefRewardRate(stakingInfo?: PangoChefInfo) {
  const blockTime = useGetBlockTimestamp();

  return useMemo(() => {
    if (!stakingInfo) {
      return BigNumber.from(0);
    }

    const userBalance = stakingInfo?.userValueVariables.balance;
    const userSumOfEntryTimes = stakingInfo?.userValueVariables.sumOfEntryTimes;

    const poolBalance = stakingInfo?.valueVariables.balance;
    const poolSumOfEntryTimes = stakingInfo?.valueVariables.sumOfEntryTimes;

    if (userBalance.isZero() || poolBalance.isZero() || !blockTime) return BigNumber.from(0);

    const blockTimestamp = BigNumber.from(blockTime.toString());
    const userValue = blockTimestamp.mul(userBalance).sub(userSumOfEntryTimes);
    const poolValue = blockTimestamp.mul(poolBalance).sub(poolSumOfEntryTimes);
    return userValue.lte(0) || poolValue.lte(0)
      ? BigNumber.from(0)
      : stakingInfo.poolRewardRate.mul(userValue).div(poolValue);
  }, [blockTime, stakingInfo]);
}

export function useIsLockingPoolZero() {
  const stakingInfos = usePangoChefInfos();

  const pairs: [Token, Token][] = useMemo(() => {
    const _pairs: [Token, Token][] = [];
    stakingInfos.forEach((stakingInfo) => {
      if (stakingInfo.isLockingPoolZero) {
        const [token0, token1] = stakingInfo.tokens;
        _pairs.push([token0, token1]);
      }
    });
    return _pairs;
  }, [stakingInfos]);

  return pairs;
}

/**
 * This hook returns the extra value provided by super farm extra reward tokens
 * @param rewardTokens array os tokens
 * @param rewardRate reward rate in png/s
 * @param multipliers multipler fro each token provider in rewardTokens
 * @param balance valueVariables from contract
 * @param pairPrice pair price in wrapped gas coin
 * @returns return the extra percentage of apr provided by super farm extra reward tokens
 */
export function usePangoChefExtraFarmApr(
  rewardTokens: Array<Token | null | undefined> | null | undefined,
  rewardRate: BigNumber,
  multipliers: JSBI[] | undefined,
  balance: BigNumber,
  pairPrice: Price,
) {
  const chainId = useChainId();
  // remove png and null
  const _rewardTokens = (rewardTokens?.filter((token) => !!token && !PNG[chainId].equals(token)) || []) as (
    | Token
    | undefined
  )[];

  const tokensPrices = useTokensCurrencyPrice(_rewardTokens);

  return useMemo(() => {
    let extraAPR = 0;

    if (!rewardTokens || !multipliers || _rewardTokens.length === 0) {
      return extraAPR;
    }

    for (let index = 0; index < _rewardTokens.length; index++) {
      const token = _rewardTokens[index];

      if (!token) {
        continue;
      }

      const tokenPrice = tokensPrices[token.address];
      const multiplier = multipliers[index];
      if (!tokenPrice || !multiplier) {
        continue;
      }
      //extraAPR = poolRewardRate(POOL_ID) * rewardMultiplier / (10** token.decimals) * 365 days * 100 * PNG_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      extraAPR +=
        balance.isZero() || pairPrice.equalTo('0')
          ? 0
          : Number(
              tokenPrice.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .multiply(multiplier)
                .divide(pairPrice.raw.multiply(balance.toString()))
                .divide((10 ** token.decimals).toString())
                .toSignificant(2),
            );
    }

    return extraAPR;
  }, [rewardTokens, rewardRate, multipliers, balance, pairPrice, tokensPrices, _rewardTokens]);
}
