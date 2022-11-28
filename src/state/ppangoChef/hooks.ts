/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
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
import { usePairsCurrencyPrice } from 'src/hooks/useCurrencyPrice';
import { useHederaPGLTokenAddresses } from 'src/state/pwallet/hooks';
import { decimalToFraction } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
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

  console.log('poolLenght', poolLenght);

  // create array with length of pools
  const allPoolsIds = new Array(Number(poolLenght ? poolLenght.toString() : 0))
    .fill(0)
    .map((_, index) => [index.toString()]);

  console.log('allPoolsIds', allPoolsIds);

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

  console.log('pools', pools);
  console.log('poolsIds', poolsIds);

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
export function useHederaPangoChefInfos() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();

  console.log('1==pangoChefContract', pangoChefContract);

  const png = PNG[chainId];

  // get the length of pools
  const poolLenght: BigNumber | undefined = useSingleCallResult(pangoChefContract, 'poolsLength').result?.[0];
  console.log('2==poolLenght', poolLenght);
  // create array with length of pools
  const allPoolsIds = new Array(Number(poolLenght ? poolLenght.toString() : 0))
    .fill(0)
    .map((_, index) => [index.toString()]);
  console.log('3==allPoolsIds', allPoolsIds);

  const poolsState = useSingleContractMultipleData(pangoChefContract, 'pools', allPoolsIds);

  console.log('4==poolsState', poolsState);
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

  console.log('4==pools', pools);
  console.log('5==poolsIds', poolsIds);

  // get reward rates for each pool
  const poolsRewardsRateState = useSingleContractMultipleData(pangoChefContract, 'poolRewardRate', poolsIds);

  console.log('6==poolsRewardsRateState', poolsRewardsRateState);

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

  console.log('7==rewardsAddresses', rewardsAddresses);

  const rewardsTokensState = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardTokens',
    [],
  );

  console.log('8==rewardsTokensState', rewardsTokensState);

  // get the address of lp tokens for each pool
  const lpTokens = useMemo(() => {
    if ((pools || []).length === 0) return [];
    return pools.map((pool) => pool?.tokenOrRecipient);
  }, [pools]);

  console.log('9==lpTokens', lpTokens);

  const lpTokenContracts = useMemo(() => {
    return lpTokens.map((lpAddress) => {
      const tokenId = hederaFn.hederaId(lpAddress);
      const contractId = hederaFn.tokenToContractId(tokenId);
      return hederaFn.idToAddress(contractId);
    });
  }, [lpTokens]);

  console.log('91==lpTokenContracts', lpTokenContracts);

  // get the tokens for each pool
  const tokens0State = useMultipleContractSingleData(
    ['0x9dd21fc0e08f895b4289ab163291e637a94fc3ad'], // TODO
    PANGOLIN_PAIR_INTERFACE,
    'token0',
    [],
  );
  const tokens1State = useMultipleContractSingleData(
    ['0x9dd21fc0e08f895b4289ab163291e637a94fc3ad'], // TODO
    PANGOLIN_PAIR_INTERFACE,
    'token1',
    [],
  );

  console.log('10==tokens0State', tokens0State);
  console.log('11==tokens1State', tokens1State);

  const tokens0Adrr = useMemo(() => {
    return tokens0State.map((result) => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [tokens0State]);

  console.log('12==tokens0Adrr', tokens0Adrr);

  const tokens1Adrr = useMemo(() => {
    return tokens1State.map((result) => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [tokens1State]);

  console.log('13==tokens1Adrr', tokens1Adrr);

  // const tokens0Adrr = ['0x0000000000000000000000000000000002Db0600'];
  // const tokens1Adrr = ['0x0000000000000000000000000000000002DfA5b2'];

  const tokens0 = useTokens(tokens0Adrr);
  const tokens1 = useTokens(tokens1Adrr);

  console.log('14==tokens0', tokens0);
  console.log('15==tokens1', tokens1);

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

  console.log('16==tokensPairs', tokensPairs);

  // get the pairs for each pool
  const pairs = usePairs(tokensPairs);

  console.log('17==pairs', pairs);

  const pairAddresses = useMemo(() => {
    return pairs.map(([, pair]) => pair?.liquidityToken?.address);
  }, [pairs]);

  console.log('18==pairAddresses', pairAddresses);

  const pglTokenAddresses = useHederaPGLTokenAddresses(pairAddresses);

  const allPglTokenAddress = useMemo(() => Object.values(pglTokenAddresses ?? {}), [pglTokenAddresses]);

  console.log('181==allPglTokenAddress', allPglTokenAddress);

  const pairTotalSuppliesState = useMultipleContractSingleData(allPglTokenAddress, ERC20_INTERFACE, 'totalSupply');

  console.log('19==pairTotalSuppliesState', pairTotalSuppliesState);

  const userInfoInput = useMemo(() => {
    if (poolsIds.length === 0 || !account) return [];
    return poolsIds.map((pid) => [pid[0], account]);
  }, [poolsIds, account]); // [[pid, account], ...] [[0, account], [1, account], [2, account] ...]

  console.log('20==userInfoInput', userInfoInput);

  // const userInfosState = useSingleContractMultipleData(pangoChefContract, 'getUser', userInfoInput ?? []);
  // TODO: Check
  const userInfosState = useSingleContractMultipleData(pangoChefContract, 'getUser', []);
  console.log('21==userInfosState', userInfosState);
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

  console.log('22==userInfos', userInfos);

  // get the user pending rewards for each pool
  // const userPendingRewardsState = useSingleContractMultipleData(
  //   pangoChefContract,
  //   'userPendingRewards',
  //   userInfoInput ?? [],
  // );
  const userPendingRewardsState = useSingleContractMultipleData(pangoChefContract, 'userPendingRewards', []); // TODO

  console.log('23==userPendingRewardsState', userPendingRewardsState);

  // const userRewardRatesState = useSingleContractMultipleData(pangoChefContract, 'userRewardRate', userInfoInput ?? []);
  const userRewardRatesState = useSingleContractMultipleData(pangoChefContract, 'userRewardRate', []); // TODO CHECK
  // console.log('24==userRewardRatesState', userRewardRatesState);

  const wavax = WAVAX[chainId];
  const [avaxPngPairState, avaxPngPair] = usePair(wavax, png);

  console.log('25==avaxPngPairState', avaxPngPairState);
  console.log('26==avaxPngPair', avaxPngPair);

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

  console.log('27==pairsToGetPrice', pairsToGetPrice);

  const pairPrices = usePairsCurrencyPrice(pairsToGetPrice);
  console.log('28==pairPrices', pairPrices);
  const { data: currencyPrice = 0 } = useCoinGeckoCurrencyPrice(chainId);

  return useMemo(() => {
    if (!chainId || !png || pairs.length == 0) return [] as PangoChefInfo[];
    console.log('29====');
    const farms: PangoChefInfo[] = [];
    for (let index = 0; index < poolsIds.length; index++) {
      console.log('30====', index);

      const poolState = poolsState[index];
      const poolRewardRateState = poolsRewardsRateState[index];
      const userInfoState = userInfosState[index];
      const token0State = tokens0State[index];
      const token1State = tokens1State[index];
      const rewardTokensState = rewardsTokensState[index];
      const userPendingRewardState = userPendingRewardsState[index];
      const pairTotalSupplyState = pairTotalSuppliesState[index];
      const userRewardRateState = userRewardRatesState[index];
      const [pairState, pair] = pairs[index];

      // if is loading or not exist pair continue
      if (
        poolState?.loading ||
        poolRewardRateState?.loading ||
        userInfoState?.loading ||
        token0State?.loading ||
        token1State?.loading ||
        rewardTokensState?.loading ||
        userPendingRewardState?.loading ||
        userRewardRateState?.loading ||
        pairTotalSupplyState?.loading ||
        pairState === PairState.LOADING ||
        avaxPngPairState == PairState.LOADING ||
        !pair ||
        !avaxPngPair
      ) {
        console.log('31================');
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
        totalRewardRatePerSecond: totalRewardRatePerSecond,
        totalRewardRatePerWeek: totalRewardRatePerWeek,
        rewardRatePerWeek: userRewardRatePerWeek,
        getHypotheticalWeeklyRewardRate: getHypotheticalWeeklyRewardRate,
        getExtraTokensWeeklyRewardRate: getExtraTokensWeeklyRewardRate,
        earnedAmount: pendingRewards,
        valueVariables: pool.valueVariables,
        userValueVariables: userInfo?.valueVariables,
        isLockingPoolZero: userInfo?.isLockingPoolZero,
        userRewardRate: userRewardRateState?.result?.[0] ?? BigNumber.from(0),
        stakingApr: apr,
        pairPrice: pairPrice,
        poolType: pool.poolType,
        poolRewardRate: rewardRate,
      } as PangoChefInfo);
    }

    console.log('32==farms', farms);
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

  //return [] as PangoChefInfo[];
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function useDummyPangoChefInfos() {
  return [] as PangoChefInfo[];
}

export function useUserPangoChefAPR(stakingInfo?: PangoChefInfo) {
  const blockTime = useGetBlockTimestamp();

  return useMemo(() => {
    if (!stakingInfo) return '0';

    const userBalance = stakingInfo?.userValueVariables?.balance || BigNumber.from(0);
    const userSumOfEntryTimes = stakingInfo?.userValueVariables?.sumOfEntryTimes;

    const poolBalance = stakingInfo?.valueVariables?.balance;
    const poolSumOfEntryTimes = stakingInfo?.valueVariables?.sumOfEntryTimes;

    if (userBalance.isZero() || poolBalance.isZero() || !blockTime) return '0';
    const blockTimestamp = BigNumber.from(blockTime.toString());

    //userAPR = poolAPR * (blockTime - (userValueVariables.sumOfEntryTimes / userValueVariables.balance)) / (blockTime - (poolValueVariables.sumOfEntryTimes / poolValueVariables.balance))
    const a = userSumOfEntryTimes.div(userBalance.isZero() ? BigNumber.from(1) : userBalance);
    const b = poolSumOfEntryTimes.div(poolBalance.isZero() ? BigNumber.from(1) : poolBalance);
    const c = blockTimestamp.sub(a);
    const d = blockTimestamp.sub(b);
    return c.lte(0) || d.lte(0)
      ? '0'
      : BigNumber.from(Math.floor(stakingInfo?.stakingApr ?? 0))
          .mul(c)
          .div(d)
          .toString();
  }, [blockTime, stakingInfo]);
}

export function useUserPangoChefRewardRate(stakingInfo: PangoChefInfo) {
  const blockTime = useGetBlockTimestamp();

  return useMemo(() => {
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
