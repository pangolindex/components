/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import {
  CHAINS,
  ChainId,
  CurrencyAmount,
  Fraction,
  JSBI,
  Pair,
  Price,
  Token,
  TokenAmount,
  WAVAX,
} from '@pangolindex/sdk';
import { getAddress, parseUnits } from 'ethers/lib/utils';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { PangochefFarmReward, useSubgraphFarms, useSubgraphFarmsStakedAmount } from 'src/apollo/pangochef';
import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_ZERO, ZERO_ADDRESS } from 'src/constants';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { PANGOLIN_PAIR_INTERFACE } from 'src/constants/abis/pangolinPair';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import { PNG, USDC } from 'src/constants/tokens';
import { PairState, usePair, usePairs } from 'src/data/Reserves';
import { useChainId, useGetBlockTimestamp, usePangolinWeb3, useRefetchMinichefSubgraph } from 'src/hooks';
import { useTokens } from 'src/hooks/Tokens';
import { useTokensCurrencyPriceHook } from 'src/hooks/multiChainsHooks';
import { usePangoChefContract, useStakingContract } from 'src/hooks/useContract';
import { usePairsCurrencyPrice } from 'src/hooks/useCurrencyPrice';
import { useCoinGeckoCurrencyPrice } from 'src/state/pcoingecko/hooks';
import { usePangoChefInfosHook } from 'src/state/ppangoChef/multiChainsHooks';
import { getExtraTokensWeeklyRewardRate, useMinichefPools } from 'src/state/pstake/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useHederaPGLTokenAddresses, useHederaPairContractEVMAddresses } from 'src/state/pwallet/hooks';
import { calculateGasMargin, decimalToFraction, waitForTransaction } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { useMultipleContractSingleData, useSingleCallResult, useSingleContractMultipleData } from '../pmulticall/hooks';
import { PangoChefInfo, Pool, PoolType, RewardSummations, UserInfo, ValueVariables } from './types';
import { calculateCompoundSlippage } from './utils';

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

  // get the weight fro each pool
  const poolsRewardInfosState = useSingleContractMultipleData(pangoChefContract, 'poolRewardInfos', poolsIds);

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
    return tokens0State.map((result) => (result?.result && result?.result?.length > 0 ? result?.result[0] : null));
  }, [tokens0State]);

  const tokens1Adrr = useMemo(() => {
    return tokens1State.map((result) => (result?.result && result?.result?.length > 0 ? result?.result[0] : null));
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
          lockCount: undefined,
        } as UserInfo;
      }

      const valueVariables = result.valueVariables as ValueVariables;
      const rewardSummations = result.rewardSummationsPaid as RewardSummations;
      const previousValues = result.previousValues;

      if (!valueVariables || !rewardSummations || !previousValues) {
        return {
          valueVariables: {
            balance: BigNumber.from(0),
            sumOfEntryTimes: BigNumber.from(0),
          },
          lockCount: undefined,
        } as UserInfo;
      }

      // `isLockingPoolZero` is for Songbird Chain Specifically as isLockingPoolZero only exist in Old PangoChef V1
      let lockCount = 0;
      if (chainId === ChainId.SONGBIRD || chainId === ChainId.COSTON) {
        lockCount = result?.isLockingPoolZero && 1;
      } else {
        // all new chain uses new pangochef i.e. using `lockCount`
        lockCount = result?.lockCount ?? 0;
      }

      return {
        valueVariables: {
          balance: valueVariables?.balance,
          sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
        } as ValueVariables,
        rewardSummations: rewardSummations,
        previousValues: previousValues,
        lockCount: lockCount,
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
          totalSupply: new TokenAmount(pair?.liquidityToken, JSBI.BigInt(pairTotalSupplyState?.result?.[0] ?? 0)),
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
      const poolsRewardInfoState = poolsRewardInfosState[index];
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
        poolsRewardInfoState.loading ||
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
        pair?.liquidityToken,
        JSBI.BigInt(pool?.valueVariables?.balance?.toString() ?? 0),
      );

      const userInfo = userInfos[index];
      const userTotalStakedAmount = new TokenAmount(
        pair?.liquidityToken,
        JSBI.BigInt(userInfo?.valueVariables?.balance ?? 0),
      );

      const pendingRewards = new TokenAmount(png, JSBI.BigInt(userPendingRewardState?.result?.[0] ?? 0));

      const pairPrice = pairPrices[pair.liquidityToken.address];
      const pngPrice = avaxPngPair.priceOf(png, wavax);

      const _totalStakedInWavax = pairPrice?.raw?.multiply(totalStakedAmount?.raw) ?? new Fraction('0', '1');

      const currencyPriceFraction = decimalToFraction(currencyPrice);

      // calculate the total staked amount in usd
      const usdcStaked = currencyPriceFraction.multiply(_totalStakedInWavax);
      const totalStakedInUsd = new TokenAmount(
        USDC[chainId],
        currencyPrice === 0 || usdcStaked.equalTo('0') ? '0' : usdcStaked.toFixed(0),
      );

      const totalStakedInWavax = new TokenAmount(
        wavax,
        _totalStakedInWavax.equalTo('0') ? '0' : _totalStakedInWavax.toFixed(0),
      );

      const getHypotheticalWeeklyRewardRate = (
        _stakedAmount: TokenAmount,
        _totalStakedAmount: TokenAmount,
        _totalRewardRatePerSecond: TokenAmount,
      ): TokenAmount => {
        return new TokenAmount(
          png,
          JSBI.greaterThan(_totalStakedAmount?.raw, JSBI.BigInt(0))
            ? JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(_totalRewardRatePerSecond?.raw, _stakedAmount?.raw),
                  BIG_INT_SECONDS_IN_WEEK,
                ),
                _totalStakedAmount?.raw,
              )
            : JSBI.BigInt(0),
        );
      };
      // poolAPR = poolRewardRate(POOL_ID) * 365 days * 100 * PNG_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      const apr =
        pool?.valueVariables?.balance.isZero() || pairPrice?.equalTo('0')
          ? 0
          : Number(
              pngPrice?.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .divide(pairPrice?.raw?.multiply(pool?.valueVariables?.balance?.toString()))
                .toSignificant(2),
            );

      const totalRewardRatePerSecond = new TokenAmount(png, rewardRate.toString());
      const totalRewardRatePerWeek = new TokenAmount(
        png,
        JSBI.multiply(totalRewardRatePerSecond?.raw, BIG_INT_SECONDS_IN_WEEK),
      );

      const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(
        userTotalStakedAmount,
        totalStakedAmount,
        totalRewardRatePerSecond,
      );

      const rewardMultipliers: JSBI[] = rewardMultipliersState?.result?.[0].map((value: BigNumber) => {
        return JSBI.BigInt(value.toString());
      });

      const weight = poolsRewardInfoState.result?.weight;

      farms.push({
        pid: pid,
        tokens: [pair.token0, pair.token1],
        stakingRewardAddress: pangoChefContract?.address,
        totalStakedAmount: totalStakedAmount,
        totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDC[chainId], BIG_INT_ZERO),
        totalStakedInWavax: totalStakedInWavax,
        multiplier: weight ? JSBI.BigInt(weight.toString()) : BIG_INT_ZERO,
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
        lockCount: userInfo.lockCount,
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
    poolsRewardInfosState,
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
export function useHederaPangoChefInfos() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();

  const png = PNG[chainId];

  const [shouldCreateStorage] = useHederaPangochefContractCreateCallback();

  // get the length of pools
  const poolLength: BigNumber | undefined = useSingleCallResult(pangoChefContract, 'poolsLength').result?.[0];

  // create array with length of pools
  const allPoolsIds = new Array(Number(poolLength ? poolLength.toString() : 0))
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

  // get the weight fro each pool
  const poolsRewardInfosState = useSingleContractMultipleData(pangoChefContract, 'poolRewardInfos', poolsIds);

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

  const pglTokenEvmAddresses = useHederaPairContractEVMAddresses(lpTokens);

  // get the tokens for each pool
  const tokens0State = useMultipleContractSingleData(pglTokenEvmAddresses, PANGOLIN_PAIR_INTERFACE, 'token0', []);
  const tokens1State = useMultipleContractSingleData(pglTokenEvmAddresses, PANGOLIN_PAIR_INTERFACE, 'token1', []);

  const tokens0Adrr = useMemo(() => {
    return tokens0State.map((result) => (result?.result && result?.result?.length > 0 ? result?.result[0] : null));
  }, [tokens0State]);

  const tokens1Adrr = useMemo(() => {
    return tokens1State.map((result) => (result?.result && result?.result?.length > 0 ? result?.result[0] : null));
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

  const pglTokenAddresses = useHederaPGLTokenAddresses(pairAddresses);

  const allPglTokenAddress = useMemo(() => Object.values(pglTokenAddresses ?? {}), [pglTokenAddresses]);

  const pairTotalSuppliesState = useMultipleContractSingleData(allPglTokenAddress, ERC20_INTERFACE, 'totalSupply');

  const userInfoInput = useMemo(() => {
    if (poolsIds.length === 0 || !account) return [];
    return poolsIds.map((pid) => [pid[0], account]);
  }, [poolsIds, account]); // [[pid, account], ...] [[0, account], [1, account], [2, account] ...]

  const userInfosState = useSingleContractMultipleData(
    pangoChefContract,
    'getUser',
    !shouldCreateStorage && userInfoInput ? userInfoInput : [],
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
      const rewardSummations = result.rewardSummationsPaid as RewardSummations;
      const previousValues = result.previousValues;

      if (!valueVariables || !rewardSummations || !previousValues) {
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
        rewardSummations: rewardSummations,
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

  const userRewardRatesState = useSingleContractMultipleData(
    pangoChefContract,
    'userRewardRate',
    !shouldCreateStorage && userInfoInput ? userInfoInput : [],
  );

  const wavax = WAVAX[chainId];
  const [avaxPngPairState, avaxPngPair] = usePair(wavax, png);

  const pairsToGetPrice = useMemo(() => {
    const _pairs: { pair: Pair; totalSupply: TokenAmount }[] = [];
    pairs.forEach(([, pair], index) => {
      const pairTotalSupplyState = pairTotalSuppliesState[index];
      if (pair && pairTotalSupplyState?.result) {
        _pairs.push({
          pair: pair,
          totalSupply: new TokenAmount(pair?.liquidityToken, JSBI.BigInt(pairTotalSupplyState?.result?.[0] ?? 0)),
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
      const poolsRewardInfoState = poolsRewardInfosState[index];
      const userInfoState = userInfosState[index];
      const token0State = tokens0State[index];
      const token1State = tokens1State[index];
      const rewardTokensState = rewardsTokensState[index];
      const rewardMultipliersState = rewardsMultipliersState[index];
      const userPendingRewardState = userPendingRewardsState[index];
      const pairTotalSupplyState = pairTotalSuppliesState[index];
      const userRewardRateState = userRewardRatesState[index];
      const [pairState, pair] = pairs?.[index] || [];

      // if is loading or not exist pair continue
      if (
        poolState?.loading ||
        poolRewardRateState?.loading ||
        userInfoState?.loading ||
        token0State?.loading ||
        token1State?.loading ||
        rewardTokensState?.loading ||
        rewardMultipliersState?.loading ||
        userPendingRewardState?.loading ||
        userRewardRateState?.loading ||
        pairTotalSupplyState?.loading ||
        poolsRewardInfoState?.loading ||
        pairState === PairState.LOADING ||
        avaxPngPairState == PairState.LOADING ||
        !pair ||
        !avaxPngPair
      ) {
        continue;
      }

      const pid = poolsIds[index][0];
      const pool = pools[index];

      const rewardRate: BigNumber = poolRewardRateState?.result?.[0] ?? BigNumber.from(0);
      const totalStakedAmount = new TokenAmount(
        pair?.liquidityToken,
        JSBI.BigInt(pool?.valueVariables?.balance?.toString() ?? 0),
      );

      const userInfo = userInfos[index];
      const userTotalStakedAmount = new TokenAmount(
        pair?.liquidityToken,
        JSBI.BigInt(userInfo?.valueVariables?.balance ?? 0),
      );

      const pendingRewards = new TokenAmount(png, JSBI.BigInt(userPendingRewardState?.result?.[0] ?? 0));

      const pairPrice = pairPrices[pair?.liquidityToken?.address];

      const pngPrice = avaxPngPair.priceOf(png, wavax);

      const _totalStakedInWavax = pairPrice?.raw?.multiply(totalStakedAmount?.raw) ?? new Fraction('0', '1');
      const currencyPriceFraction = decimalToFraction(currencyPrice);

      // calculate the total staked amount in usd
      const totalStakedInUsd = new TokenAmount(
        USDC[chainId],

        _totalStakedInWavax.equalTo('0')
          ? '0'
          : currencyPriceFraction
              .multiply(_totalStakedInWavax)
              .multiply(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(USDC[chainId]?.decimals)))
              .toFixed(0),
      );

      const totalStakedInWavax = new TokenAmount(
        wavax,

        _totalStakedInWavax.equalTo('0')
          ? '0'
          : _totalStakedInWavax.multiply(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(wavax?.decimals))).toFixed(0),
      );

      const getHypotheticalWeeklyRewardRate = (
        _stakedAmount: TokenAmount,
        _totalStakedAmount: TokenAmount,
        _totalRewardRatePerSecond: TokenAmount,
      ): TokenAmount => {
        return new TokenAmount(
          png,
          JSBI.greaterThan(_totalStakedAmount?.raw, JSBI.BigInt(0))
            ? JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(_totalRewardRatePerSecond?.raw, _stakedAmount?.raw),
                  BIG_INT_SECONDS_IN_WEEK,
                ),
                _totalStakedAmount?.raw,
              )
            : JSBI.BigInt(0),
        );
      };

      // poolAPR = poolRewardRate(POOL_ID) * 365 days * 100 * PNG_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      const apr =
        pool?.valueVariables?.balance?.isZero() || pairPrice?.equalTo('0') || !pairPrice
          ? 0
          : Number(
              pngPrice?.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .divide(pairPrice?.raw?.multiply(pool?.valueVariables?.balance?.toString()))
                // here apr is in 10^8 so we needed to divide by 10^8 to keep it in simple form
                .divide(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(8)))
                .toSignificant(2),
            );

      const totalRewardRatePerSecond = new TokenAmount(png, rewardRate.toString());
      const totalRewardRatePerWeek = new TokenAmount(
        png,
        JSBI.multiply(totalRewardRatePerSecond?.raw, BIG_INT_SECONDS_IN_WEEK),
      );

      const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(
        userTotalStakedAmount,
        totalStakedAmount,
        totalRewardRatePerSecond,
      );

      const rewardMultipliers: JSBI[] = rewardMultipliersState?.result?.[0].map((value: BigNumber) => {
        return JSBI.BigInt(value.toString());
      });

      const weight = poolsRewardInfoState.result?.weight;

      farms.push({
        pid: pid,
        tokens: [pair?.token0, pair?.token1],
        stakingRewardAddress: pangoChefContract?.address,
        totalStakedAmount: totalStakedAmount,
        totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDC[chainId], BIG_INT_ZERO),
        totalStakedInWavax: totalStakedInWavax,
        multiplier: weight ? JSBI.BigInt(weight.toString()) : BIG_INT_ZERO,
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
        lockCount: userInfo?.lockCount,
        userRewardRate: userRewardRateState?.result?.[0] ?? BigNumber.from(0),
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
    poolsRewardInfosState,
    userInfosState,
    tokens0State,
    tokens1State,
    rewardsTokensState,
    pairTotalSuppliesState,
    userPendingRewardsState,
    pairs,
  ]);
  // return [] as PangoChefInfo[];
}

export function useGetPangoChefInfosViaSubgraph() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const png = PNG[chainId];
  const [shouldCreateStorage] = useHederaPangochefContractCreateCallback();
  const pangoChefContract = usePangoChefContract();

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

  const poolsState = useSingleContractMultipleData(pangoChefContract, 'pools', allPoolsIds, {
    // avoid unnecessary calls by
    // only fetching pools info on page load, as pools info doesnt change much
    blocksPerFetch: 0,
  });

  const totalPangochefRewardRate = pangoChefData?.rewardRate;
  const totalPangochefWeight = pangoChefData?.totalWeight;

  // format the data to Pool type
  const pools = useMemo(() => {
    const _pools: { [pid: string]: Pool } = {};

    for (let i = 0; i < poolsState.length; i++) {
      const result = poolsState[i]?.result;

      if (!result) {
        continue;
      }

      const pid = allPoolsIds[i][0];
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
      _pools[pid] = {
        tokenOrRecipient: tokenOrRecipient,
        poolType: poolType,
        rewarder: rewarder,
        rewardPair: rewardPair,
        valueVariables: {
          balance: valueVariables?.balance,
          sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
        } as ValueVariables,
        rewardSummations: rewardSummations,
      };
    }

    return _pools;
  }, [poolsState]);

  const userInfoInput = useMemo(() => {
    if ((allPoolsIds || []).length === 0 || !account) return [];
    return allPoolsIds.map((pid) => [pid[0], account]);
  }, [allPoolsIds, account]); // [[pid, account], ...] [[0, account], [1, account], [2, account] ...]

  // for hedera by cutting costs let's eliminate this call
  // and just use the balance of the subgraph and sumOfEntryTimes as 0
  // since we are not going to use that because hedera has the correct values
  // for reward rate and with that is not to use sumOfEntryTimes
  const userInfosState = useSingleContractMultipleData(
    hederaFn.isHederaChain(chainId) ? null : pangoChefContract,
    'getUser',
    !shouldCreateStorage && userInfoInput ? userInfoInput : [],
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
      const rewardSummations = result.rewardSummationsPaid as RewardSummations;
      const previousValues = result.previousValues;

      if (!valueVariables || !rewardSummations || !previousValues) {
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
        rewardSummations: rewardSummations,
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

  const userRewardRatesState = useSingleContractMultipleData(
    pangoChefContract,
    'userRewardRate',
    !shouldCreateStorage && userInfoInput ? userInfoInput : [],
  );

  return useMemo(() => {
    if (!chainId || !png || !allFarms?.length) return [];

    const farms: PangoChefInfo[] = [];
    for (let index = 0; index < allPoolsIds.length; index++) {
      const farm = allFarms[index];

      // const poolState = poolsState[index];
      // const userInfoState = userInfosState[index];

      const userPendingRewardState = userPendingRewardsState[index];
      const userRewardRateState = userRewardRatesState[index];
      const userInfo = userInfos[index];

      // if is loading or not exist pair continue
      if (
        // poolState?.loading ||
        // userInfoState?.loading ||
        // userPendingRewardState?.loading ||
        // userRewardRateState?.loading ||
        // poolRewardRateState?.loading ||
        avaxPngPairState == PairState.LOADING ||
        !avaxPngPair
      ) {
        continue;
      }

      const rewards = farm.rewarder.rewards;

      const pid = farm?.pid;
      const pool = pools?.[pid];
      const pair = farm?.pair;
      const multiplier = JSBI.BigInt(farm?.weight);

      const rewardTokensAddress = rewards.map((rewardToken: PangochefFarmReward) => {
        const tokenObj = rewardToken.token;
        return getAddress(tokenObj.id);
      });

      const rewardMultipliers: JSBI[] = rewards.map((rewardToken: PangochefFarmReward) => {
        return JSBI.BigInt(rewardToken?.multiplier.toString());
      });

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

      const tokens = [token0, token1];
      const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
      const lpToken = dummyPair.liquidityToken;

      const farmTvl = farm?.tvl ?? '0';
      const _farmTvl = Number(farmTvl) <= 0 ? '0' : farmTvl;
      const farmTvlAmount = new TokenAmount(lpToken, _farmTvl || JSBI.BigInt(0));

      const reserve0 = parseUnits(pair?.reserve0?.toString(), pair?.token0.decimals);

      const reserve0Amount = new TokenAmount(token0, reserve0?.toString() || JSBI.BigInt(0));

      const reserve1 = parseUnits(pair?.reserve1?.toString(), pair?.token1.decimals);

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

      // totalPangochefWeight -> totalPangochefRewardRate
      // farm?.weight -> ?
      // rewardRate = (farm?.weight * totalPangochefRewardRate) / totalPangochefWeight
      const rewardRate: BigNumber =
        farm?.weight === '0' || !totalPangochefWeight
          ? BigNumber.from(0)
          : BigNumber.from(totalPangochefRewardRate ?? 0)
              .mul(farm?.weight)
              .div(totalPangochefWeight);
      const pngPrice = avaxPngPair.priceOf(png, wavax);

      const pairPriceInEth = totalSupplyInETH.divide(totalSupplyAmount);
      const pairPrice = new Price(lpToken, wavax, pairPriceInEth?.denominator, pairPriceInEth?.numerator);

      // poolAPR = poolRewardRate(POOL_ID) * 365 days * 100 * PNG_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      const apr =
        _farmTvl === '0' || pairPriceInEth?.equalTo('0') || !pairPriceInEth
          ? 0
          : Number(
              pngPrice?.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .divide(pairPriceInEth?.multiply(_farmTvl))
                // here apr is in 10^8 so we needed to divide by 10^8 to keep it in simple form
                .divide(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(8)))
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

      farms.push({
        pid: pid,
        tokens,
        stakingRewardAddress: pangoChefContract?.address,
        totalStakedAmount: totalStakedAmount,
        totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDC[chainId], BIG_INT_ZERO),
        stakedAmount: userTotalStakedAmount,
        periodFinish: undefined,
        multiplier,
        rewardTokensAddress,
        rewardTokensMultiplier: rewardMultipliers,
        totalStakedInWavax: totalStakedInWavax,
        isPeriodFinished: rewardRate.isZero(),
        rewardsAddress: pool?.rewarder,
        totalRewardRatePerSecond: totalRewardRatePerSecond,
        totalRewardRatePerWeek: totalRewardRatePerWeek,
        rewardRatePerWeek: userRewardRatePerWeek,
        getHypotheticalWeeklyRewardRate: getHypotheticalWeeklyRewardRate,
        getExtraTokensWeeklyRewardRate: getExtraTokensWeeklyRewardRate,
        earnedAmount: pendingRewards,
        valueVariables: pool?.valueVariables,
        userValueVariables: userInfo?.valueVariables,
        lockCount: userInfo?.lockCount,
        userRewardRate: userRewardRateState?.result?.[0] ?? BigNumber.from(0),
        stakingApr: apr,
        pairPrice,
        poolType: pool?.poolType,
        poolRewardRate: rewardRate,
      } as PangoChefInfo);
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
    poolsState,
  ]);
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function useDummyPangoChefInfos() {
  return [] as PangoChefInfo[];
}

/**
 * This hook return a user's user for songbird and coston
 * For these chains we need to use this because the function that returns the user's reward rate is broken
 * @param stakingInfo Staking info provided by usePangoChefInfos
 * @returns return the apr of user
 */
export function useLegacyUserPangoChefAPR(stakingInfo?: PangoChefInfo) {
  const blockTime = useGetBlockTimestamp();

  return useMemo(() => {
    if (!stakingInfo) return '0';

    const userBalance = stakingInfo?.userValueVariables?.balance || BigNumber.from(0);
    const userSumOfEntryTimes = stakingInfo?.userValueVariables?.sumOfEntryTimes || BigNumber.from(0);

    const poolBalance = stakingInfo?.valueVariables?.balance || BigNumber.from(0);
    const poolSumOfEntryTimes = stakingInfo?.valueVariables?.sumOfEntryTimes || BigNumber.from(0);

    if (!userBalance || userBalance.isZero() || !poolBalance || poolBalance.isZero() || !blockTime) return '0';
    const blockTimestamp = BigNumber.from(blockTime.toString());

    //userAPR = poolAPR * (blockTime - (userValueVariables.sumOfEntryTimes / userValueVariables.balance)) / (blockTime - (poolValueVariables.sumOfEntryTimes / poolValueVariables.balance))
    const a = userSumOfEntryTimes.div(userBalance.isZero() ? BigNumber.from(1) : userBalance);
    const b = poolSumOfEntryTimes.div(poolBalance.isZero() ? BigNumber.from(1) : poolBalance);
    const c = blockTimestamp.sub(a);
    const d = blockTimestamp.sub(b);
    return c.lte(0) || d.lte(0)
      ? '0'
      : BigNumber.from(Math.floor(stakingInfo?.stakingApr ?? 0)?.toString())
          .mul(c)
          .div(d)
          .toString();
  }, [blockTime, stakingInfo]);
}

/**
 * This hook return the apr of a user
 *
 * @param stakingInfo Staking info provided by usePangoChefInfos
 * @returns return the apr of user
 */
export function useUserPangoChefAPR(stakingInfo?: PangoChefInfo) {
  const chainId = useChainId();

  const png = PNG[chainId];
  const wavax = WAVAX[chainId];

  const [, pair] = usePair(png, wavax);

  return useMemo(() => {
    if (!stakingInfo || !pair) return '0';

    const userRewardRate = stakingInfo.userRewardRate;
    const pngPrice = pair.priceOf(png, wavax);

    const pairPrice = stakingInfo.pairPrice;
    const balance = stakingInfo.stakedAmount;

    const pairBalance = pairPrice.raw.multiply(balance).toFixed(0);

    //userApr = userRewardRate(POOL_ID, USER_ADDRESS) * 365 days * 100 * PNG_PRICE / (getUser(POOL_ID, USER_ADDRESS).valueVariables.balance * STAKING_TOKEN_PRICE)
    return pairPrice.equalTo('0') || balance.equalTo('0') || pairBalance === '0'
      ? '0'
      : userRewardRate.mul(86400).mul(365).mul(100).mul(pngPrice.raw.toFixed(0)).div(pairBalance).toString();
  }, [stakingInfo, pair]);
}

export function useUserPangoChefRewardRate(stakingInfo?: PangoChefInfo) {
  const chainId = useChainId();
  const blockTime = useGetBlockTimestamp();

  return useMemo(() => {
    if (!stakingInfo) {
      return BigNumber.from(0);
    }

    if (chainId !== ChainId.SONGBIRD && chainId !== ChainId.COSTON) {
      return stakingInfo.userRewardRate;
    }

    const userBalance = stakingInfo?.userValueVariables?.balance || BigNumber.from(0);
    const userSumOfEntryTimes = stakingInfo?.userValueVariables?.sumOfEntryTimes || BigNumber.from(0);

    const poolBalance = stakingInfo?.valueVariables?.balance || BigNumber.from(0);
    const poolSumOfEntryTimes = stakingInfo?.valueVariables?.sumOfEntryTimes || BigNumber.from(0);

    if (userBalance?.isZero() || poolBalance.isZero() || !blockTime) return BigNumber.from(0);

    const blockTimestamp = BigNumber.from(blockTime.toString());
    const userValue = blockTimestamp.mul(userBalance).sub(userSumOfEntryTimes);
    const poolValue = blockTimestamp.mul(poolBalance).sub(poolSumOfEntryTimes);
    return userValue.lte(0) || poolValue.lte(0)
      ? BigNumber.from(0)
      : stakingInfo?.poolRewardRate?.mul(userValue).div(poolValue);
  }, [blockTime, stakingInfo, chainId]);
}

/**
 * this hook is useful to check whether user has created pangochef storage contract or not
 * if not then using this hook we can create user's storage contract
 * @returns [boolean, function_to_create]
 */
export function useHederaPangochefContractCreateCallback(): [boolean, () => Promise<void>] {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();
  const addTransaction = useTransactionAdder();

  // get on chain data
  const { data: userStorageAddress, refetch } = useQuery(
    ['hedera-pangochef-user-storage', account],
    async (): Promise<string | undefined> => {
      try {
        const response = await pangoChefContract?.getUserStorageContract(account);
        return response as string;
      } catch (error) {
        return undefined;
      }
    },
    { enabled: Boolean(pangoChefContract) && Boolean(account) && hederaFn.isHederaChain(chainId) },
  );

  // we need on chain fallback
  // because user might have created a storage contract but haven't staked into anything yet
  // if we replace subgraph logic without fallback then user will be stuck forever in
  // "create storage contract" flow because subgraph thinking that there is no farmingPositions
  // but actually user has created storage contract
  const hasOnChainData = typeof userStorageAddress !== 'undefined';
  const onChainShouldCreateStorage = userStorageAddress === ZERO_ADDRESS || !userStorageAddress ? true : false;

  // get off chain data using subgraph
  // we also get data from subgraph just to make sure user doesn't stuck anywhere in flow
  const { data, refetch: refetchSubgraph } = useSubgraphFarmsStakedAmount();
  const offChainShouldCreateStorage = Boolean(!data || data.length === 0);

  const shouldCreateStorage = hasOnChainData ? onChainShouldCreateStorage : offChainShouldCreateStorage;

  const create = useCallback(async (): Promise<void> => {
    if (!account) {
      console.error('no account');
      return;
    }

    try {
      const response = await hederaFn.createPangoChefUserStorageContract(chainId, account);

      if (response) {
        refetch();
        refetchSubgraph();
        addTransaction(response, {
          summary: 'Created Pangochef User Storage Contract',
        });
      }
    } catch (error) {
      console.debug('Failed to create pangochef contract', error);
    }
  }, [account, chainId, addTransaction]);

  if (!hederaFn.isHederaChain(chainId)) {
    return [
      false,
      () => {
        return Promise.resolve();
      },
    ];
  }

  return [shouldCreateStorage, create];
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
  const useTokensCurrencyPrice = useTokensCurrencyPriceHook[chainId];
  // remove png and null
  const _rewardTokens = (rewardTokens?.filter((token) => !!token && !PNG[chainId].equals(token)) || []) as (
    | Token
    | undefined
  )[];

  const tokensPrices = useTokensCurrencyPrice(_rewardTokens);

  // as of now this is needed specifically for hedera
  // in Hedera we need to divide final apr with 10^8 to make sure it shows in proper format
  // for all other chains its just 10^0 = 1
  let aprDenominator = 10 ** 0;
  if (hederaFn.isHederaChain(chainId)) {
    aprDenominator = 10 ** 8;
  }

  return useMemo(() => {
    let extraAPR = 0;

    if (!rewardTokens || !multipliers || _rewardTokens.length === 0) {
      return extraAPR;
    }

    for (let index = 0; index < _rewardTokens.length; index++) {
      const token = _rewardTokens[index];

      if (!token) {
        console.log('error1');
        continue;
      }

      const tokenPrice = tokensPrices[token.address];
      const multiplier = multipliers[index];
      if (!tokenPrice || !multiplier) {
        continue;
      }

      //extraAPR = poolRewardRate(POOL_ID) * rewardMultiplier / (10** token.decimals) * 365 days * 100 * PNG_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      extraAPR +=
        !pairPrice || !balance || balance.isZero() || pairPrice.equalTo('0')
          ? 0
          : Number(
              tokenPrice.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .multiply(multiplier)
                .divide(pairPrice.raw.multiply(balance.toString()))
                .divide((10 ** token.decimals).toString())
                .divide(aprDenominator.toString())
                .toSignificant(2),
            );
    }

    return extraAPR;
  }, [rewardTokens, rewardRate, multipliers, balance, pairPrice, tokensPrices, _rewardTokens]);
}

/**
 * pangochef stake callback function
 * @param poolId
 * @param amount
 * @returns callback and error
 */
export function useEVMPangoChefStakeCallback(
  poolId: string | null,
  amount: string | undefined,
): { callback: null | (() => Promise<string>); error: string | null } {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const pangoChefContract = usePangoChefContract();
  return useMemo(() => {
    return {
      callback: async function onStake(): Promise<string> {
        try {
          if (!pangoChefContract) return '';
          const response: TransactionResponse = await pangoChefContract.stake(poolId, amount);
          await waitForTransaction(response, 5);

          if (response) {
            addTransaction(response, {
              summary: t('earn.depositLiquidity'),
            });
            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Swap failed`, error);

            throw new Error(`${t('earn.attemptingToStakeError')} :${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [poolId, account, chainId, amount, addTransaction, pangoChefContract]);
}

/**
 * hedera pangochef stake callback function
 * @param poolId
 * @param amount
 * @returns callback and error
 */
export function useHederaPangoChefStakeCallback(
  poolId: string | null,
  amount: string | undefined,
): { callback: null | (() => Promise<string>); error: string | null } {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  return useMemo(() => {
    if (!poolId || !account || !chainId || !amount) {
      return { callback: null, error: 'Missing dependencies' };
    }

    return {
      callback: async function onStake(): Promise<string> {
        try {
          const response = await hederaFn.stakeOrWithdraw({
            poolId,
            account,
            chainId,
            amount,
            methodName: 'stake',
          });

          if (response) {
            addTransaction(response, {
              summary: t('earn.depositLiquidity'),
            });
            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Stake failed`, error);
            throw new Error(`${t('earn.attemptingToStakeError')} :${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [poolId, account, chainId, amount, addTransaction]);
}

export function useDummyPangoChefCallback(): { callback: null | (() => Promise<string>); error: string | null } {
  return { callback: null, error: null };
}

/**
 * pangochef claim reward callback function
 * @param poolId
 * @param poolType
 * @returns callback and error
 */
export function useEVMPangoChefClaimRewardCallback(
  poolId: string | null,
  poolType: PoolType,
): { callback: null | (() => Promise<string>); error: string | null } {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();

  const png = PNG[chainId];

  const addTransaction = useTransactionAdder();

  const pangoChefContract = usePangoChefContract();
  return useMemo(() => {
    return {
      callback: async function onClaimReward(): Promise<string> {
        try {
          if (!pangoChefContract) return '';
          const method = poolType === PoolType.RELAYER_POOL ? 'claim' : 'harvest';

          const response: TransactionResponse = await pangoChefContract[method](poolId);
          await waitForTransaction(response, 1);
          if (response) {
            addTransaction(response, {
              summary: t('earn.claimAccumulated', { symbol: png.symbol }),
            });
            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Claim failed`, error);

            throw new Error(`error :${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [poolId, account, chainId, poolType, addTransaction, pangoChefContract]);
}

/**
 * hedera pangochef claim reward callback function
 * @param poolId
 * @param poolType
 * @returns callback and error
 */
export function useHederaPangoChefClaimRewardCallback(
  poolId: string | null,
  poolType: PoolType,
): { callback: null | (() => Promise<string>); error: string | null } {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();

  const addTransaction = useTransactionAdder();
  const png = PNG[chainId];
  return useMemo(() => {
    if (!poolId || !account || !chainId || !poolType) {
      return { callback: null, error: 'Missing dependencies' };
    }

    return {
      callback: async function onClaimReward(): Promise<string> {
        try {
          const method = poolType === PoolType.RELAYER_POOL ? 'claim' : 'harvest';

          const args = {
            poolId,
            account,
            chainId,
            methodName: method,
          };
          const response = await hederaFn.claimReward(args);

          if (response) {
            addTransaction(response, {
              summary: t('earn.claimAccumulated', { symbol: png.symbol }),
            });
            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Claim Reward failed`, error);
            throw new Error(`error :${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [poolId, account, chainId, poolType, addTransaction]);
}

export interface WithdrawData {
  version?: number;
  poolId: string | undefined;
  stakedAmount: TokenAmount;
  stakingRewardAddress?: string;
}

/**
 * pangochef withdraw callback function
 * @param withdrawData
 * @param version
 * @returns callback and error
 */
export function useEVMPangoChefWithdrawCallback(withdrawData: WithdrawData): {
  callback: null | (() => Promise<string>);
  error: string | null;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const { version, poolId, stakedAmount, stakingRewardAddress } = withdrawData;

  const poolMap = useMinichefPools();
  const stakingContract = useStakingContract(stakingRewardAddress);
  const pangoChefContract = usePangoChefContract();

  const refetchMinichefSubgraph = useRefetchMinichefSubgraph();
  const contract = version && version <= 2 ? stakingContract : pangoChefContract;

  return useMemo(() => {
    return {
      callback: async function onWithdraw(): Promise<string> {
        try {
          if (!contract || (version === 2 && !poolMap)) return '';

          const method = version === 1 ? 'exit' : version === 2 ? 'withdrawAndHarvest' : 'withdraw';
          const args =
            version === 1
              ? []
              : version === 2
              ? [poolMap[stakedAmount?.token?.address], `0x${stakedAmount?.raw.toString(16)}`, account]
              : [poolId, `0x${stakedAmount?.raw.toString(16)}`];

          const response: TransactionResponse = await contract[method](...args);

          await waitForTransaction(response, 5);

          if (response) {
            addTransaction(response, {
              summary: t('earn.withdrawDepositedLiquidity'),
            });
            await refetchMinichefSubgraph();
            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Withdraw failed`, error);

            throw new Error(`Error :${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [account, chainId, poolId, stakedAmount, addTransaction, contract]);
}

/**
 * hedera pangochef withdraw callback function
 * @param withdrawData
 * @returns callback and error
 */
export function useHederaPangoChefWithdrawCallback(withdrawData: WithdrawData): {
  callback: null | (() => Promise<string>);
  error: string | null;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();
  const { poolId, stakedAmount } = withdrawData;
  return useMemo(() => {
    if (!account || !chainId || !poolId || !stakedAmount) {
      return { callback: null, error: 'Missing dependencies' };
    }

    return {
      callback: async function onWithdraw(): Promise<string> {
        try {
          const response = await hederaFn.stakeOrWithdraw({
            poolId,
            account,
            chainId,
            amount: stakedAmount?.raw?.toString(),
            methodName: 'withdraw',
          });

          if (response) {
            addTransaction(response, {
              summary: t('earn.withdrawDepositedLiquidity'),
            });
            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Withdraw failed`, error);
            throw new Error(`Error :${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [account, chainId, poolId, stakedAmount, addTransaction]);
}

interface PangoChefCompoundData {
  poolId: string | undefined;
  isPNGPool: boolean;
  amountToAdd: CurrencyAmount | TokenAmount;
}

/**
 * pangochef compound callback function
 * @param withdrawData
 * @param version
 * @returns callback and error
 */
export function useEVMPangoChefCompoundCallback(compoundData: PangoChefCompoundData): {
  callback: null | (() => Promise<string>);
  error: string | null;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const { poolId, isPNGPool, amountToAdd } = compoundData;

  const pangoChefContract = usePangoChefContract();

  return useMemo(() => {
    return {
      callback: async function onCompound(): Promise<string> {
        try {
          if (!pangoChefContract) return '';

          const minichef = CHAINS[chainId].contracts?.mini_chef;
          const compoundPoolId = minichef?.compoundPoolIdForNonPngFarm ?? 0;

          const slippage = calculateCompoundSlippage(amountToAdd);
          // `compoundToPoolZero` is for Songbird Chain Specifically as compoundToPoolZero only exist in Old PangoChef V1
          // all new chain uses new pangochef method i.e. `compoundTo`
          const nonPNGPoolMethod =
            chainId === ChainId.SONGBIRD || chainId === ChainId.COSTON ? 'compoundToPoolZero' : 'compoundTo';
          const method = isPNGPool ? 'compound' : nonPNGPoolMethod;

          const pngPoolArg = [`0x${Number(poolId).toString(16)}`, slippage];
          const nonPNGPoolArg =
            chainId === ChainId.SONGBIRD || chainId === ChainId.COSTON
              ? pngPoolArg
              : [`0x${Number(poolId).toString(16)}`, `0x${Number(compoundPoolId).toString(16)}`, slippage];

          const args = isPNGPool ? pngPoolArg : nonPNGPoolArg;
          const estimatedGas = await pangoChefContract.estimateGas[method](...args, {
            value: amountToAdd instanceof TokenAmount ? '0x0' : slippage.maxPairAmount,
          });
          const response: TransactionResponse = await pangoChefContract[method](...args, {
            gasLimit: calculateGasMargin(estimatedGas),
            value: amountToAdd instanceof TokenAmount ? '0x0' : slippage.maxPairAmount,
          });
          await waitForTransaction(response, 1);

          if (response) {
            addTransaction(response, {
              summary: t('pangoChef.compoundTransactionSummary'),
            });

            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Compound failed`, error);

            throw new Error(`Error :${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [account, chainId, poolId, amountToAdd, addTransaction, pangoChefContract]);
}

/**
 * hedera pangochef compound callback function
 * @param compoundData
 * @returns callback and error
 */
export function useHederaPangoChefCompoundCallback(compoundData: PangoChefCompoundData): {
  callback: null | (() => Promise<string>);
  error: string | null;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();
  const pangoChefContract = usePangoChefContract();

  const { poolId, isPNGPool, amountToAdd } = compoundData;

  return useMemo(() => {
    if (!account || !chainId || !poolId || !amountToAdd) {
      return { callback: null, error: 'Missing dependencies' };
    }

    return {
      callback: async function onWithdraw(): Promise<string> {
        try {
          if (!pangoChefContract) return '';

          const method = isPNGPool ? 'compound' : 'compoundTo';

          const slippage = calculateCompoundSlippage(amountToAdd);

          const response = await hederaFn.compound({
            poolId,
            account,
            chainId,
            slippage,
            methodName: method,
            contract: pangoChefContract,
          });

          if (response) {
            addTransaction(response, {
              summary: t('pangoChef.compoundTransactionSummary'),
            });
            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Compound failed`, error);
            throw new Error(`Error :${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [account, chainId, poolId, amountToAdd, addTransaction, pangoChefContract]);
}

/**
 * this hook is basically for PangoChef v1, which is only used by Songbird right now
 * this hook returns pairs which are locking Pool Zero
 * @returns [Token, Token][] pairs array
 */
export function useGetLockingPoolsForPoolZero() {
  const chainId = useChainId();
  const usePangoChefInfos = usePangoChefInfosHook[chainId];

  const stakingInfos = usePangoChefInfos();

  const pairs: [Token, Token][] = useMemo(() => {
    const _pairs: [Token, Token][] = [];
    stakingInfos?.forEach((stakingInfo) => {
      if (stakingInfo?.lockCount && stakingInfo?.lockCount > 0) {
        const [token0, token1] = stakingInfo.tokens;
        _pairs.push([token0, token1]);
      }
    });
    return _pairs;
  }, [stakingInfos]);

  return pairs;
}

export function useDummyIsLockingPoolZero() {
  const _pairs: [Token, Token][] = [];

  return _pairs;
}

/**
 * To get how many pools locked to given pool
 * @param poolId
 * @returns  [Token, Token][] pairs array
 */
export function useGetLockingPoolsForPoolId(poolId: string) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();

  const usePangoChefInfos = usePangoChefInfosHook[chainId];

  const stakingInfos = usePangoChefInfos();

  const allPoolsIds = (stakingInfos || []).map((stakingInfo) => {
    if (!account || !chainId) {
      return undefined;
    }

    return [stakingInfo?.pid?.toString(), account];
  });

  const lockPoolState = useSingleContractMultipleData(pangoChefContract, 'getLockedPools', allPoolsIds);

  const _lockpools = useMemo(() => {
    const container = {} as { [poolId: string]: Array<string> };

    allPoolsIds.forEach((value, index) => {
      const result = lockPoolState[index]?.result;
      const pid = value?.[0];

      if (result?.[0]?.[0]?.toString() && pid) {
        container[`${pid}`] = result?.[0]?.map((item: BigNumber) => item.toString());
      }
    });

    return container;
  }, [allPoolsIds]);

  const lockingPools = [] as Array<string>;
  Object.entries(_lockpools).forEach(([pid, pidsLocked]) => {
    if (pidsLocked.includes(poolId?.toString())) {
      lockingPools.push(pid);
    }
  });

  const pairs: [Token, Token][] = useMemo(() => {
    const _pairs: [Token, Token][] = [];

    if (lockingPools?.length > 0) {
      stakingInfos?.forEach((stakingInfo) => {
        if (lockingPools.includes(stakingInfo?.pid)) {
          const [token0, token1] = stakingInfo.tokens;
          _pairs.push([token0, token1]);
        }
      });
    }

    return _pairs;
  }, [stakingInfos, lockingPools]);

  return pairs;
}
/* eslint-enable max-lines */
