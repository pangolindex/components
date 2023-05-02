/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { Fraction, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { getAddress, parseUnits } from 'ethers/lib/utils';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useSubgraphFarms, useSubgraphFarmsStakedAmount } from 'src/apollo/pangochef';
import { BIGNUMBER_ZERO, BIG_INT_SECONDS_IN_WEEK, BIG_INT_ZERO, ZERO_ADDRESS, ZERO_FRACTION } from 'src/constants';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { PANGOLIN_PAIR_INTERFACE } from 'src/constants/abis/pangolinPair';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import { PNG, USDC } from 'src/constants/tokens';
import { PairState, usePair, usePairsContract } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3, useRefetchPangoChefSubgraph } from 'src/hooks';
import { useLastBlockTimestampHook } from 'src/hooks/block';
import { useTokensContract } from 'src/hooks/tokens/evm';
import { usePangoChefContract } from 'src/hooks/useContract';
import { usePairsCurrencyPrice } from 'src/hooks/useCurrencyPrice';
import { useCoinGeckoCurrencyPrice } from 'src/state/pcoingecko/hooks';
import { getExtraTokensWeeklyRewardRate } from 'src/state/pstake/utils';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useHederaPGLTokenAddresses, useHederaPairContractEVMAddresses } from 'src/state/pwallet/hooks/hedera';
import { decimalToFraction } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { useShouldUseSubgraph } from '../../papplication/hooks';
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../../pmulticall/hooks';
import { PangoChefCompoundData, PangoChefInfo, Pool, PoolType, UserInfo, ValueVariables, WithdrawData } from '../types';
import { calculateCompoundSlippage, calculateUserAPR, calculateUserRewardRate } from '../utils';

/* eslint-disable @typescript-eslint/no-unused-vars */
export function useHederaPangoChefInfos() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();

  const useGetBlockTimestamp = useLastBlockTimestampHook[chainId];
  const blockTime = useGetBlockTimestamp();

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

      if (!tokenOrRecipient || !poolType || !rewarder || !rewardPair || !valueVariables) {
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

  const tokens0 = useTokensContract(tokens0Adrr);
  const tokens1 = useTokensContract(tokens1Adrr);

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
  const pairs = usePairsContract(tokensPairs);

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

      const _pairPrice = pairPrices[pair?.liquidityToken?.address];
      const pairPrice = _pairPrice ? _pairPrice.raw : ZERO_FRACTION;

      const pngPrice = avaxPngPair.priceOf(png, wavax);

      const _totalStakedInWavax = pairPrice.multiply(totalStakedAmount?.raw);

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
                .divide(pairPrice.multiply(pool?.valueVariables?.balance?.toString()))
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

      const userRewardRate = calculateUserRewardRate(
        userInfo?.valueVariables,
        pool.valueVariables,
        rewardRate,
        blockTime,
      );

      const userApr = calculateUserAPR({
        pairPrice: pairPrice,
        png,
        pngPrice,
        userRewardRate,
        stakedAmount: userTotalStakedAmount,
      });

      farms.push({
        pid: pid,
        tokens: [pair?.token0, pair?.token1],
        stakingRewardAddress: pangoChefContract?.address ?? '',
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
        userRewardRate: userRewardRate,
        stakingApr: apr,
        pairPrice: pairPrice,
        poolType: pool.poolType,
        poolRewardRate: new Fraction(rewardRate.toString()),
        userApr,
      });
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
    blockTime,
  ]);
  // return [] as PangoChefInfo[];
}

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

  return useMemo(() => {
    if (!chainId || !png || !allFarms?.length) return [];

    const farms: PangoChefInfo[] = [];
    for (let index = 0; index < allPoolsIds.length; index++) {
      const farm = allFarms[index];

      const userPendingRewardState = userPendingRewardsState[index];
      const userInfo = userInfos[index];

      // if is loading or not exist pair continue
      if (
        !farm.pair || // skip pull with pair null because it is relayer
        avaxPngPairState == PairState.LOADING ||
        !avaxPngPair
      ) {
        continue;
      }

      const rewards = farm.rewarder.rewards;

      const pid = farm?.pid;
      const pair = farm?.pair;
      const multiplier = JSBI.BigInt(farm?.weight);

      const { rewardTokensAddress, rewardTokens, rewardMultipliers } = rewards.reduce(
        (memo, rewardToken) => {
          const tokenObj = rewardToken.token;
          const _address = getAddress(tokenObj.id);
          const _token = new Token(chainId, _address, Number(tokenObj.decimals), tokenObj.symbol, tokenObj.name);
          const _multiplier = JSBI.BigInt(rewardToken?.multiplier.toString());

          // remove png from rewards
          if (_token.equals(png)) {
            return memo;
          }

          memo.rewardTokensAddress.push(_address);
          memo.rewardTokens.push(_token);
          memo.rewardMultipliers.push(_multiplier);
          return memo;
        },
        {
          rewardTokensAddress: [] as string[],
          rewardTokens: [] as Token[],
          rewardMultipliers: [] as JSBI[],
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

      const userRewardRate = calculateUserRewardRate(userValueVariables, poolValueVariables, rewardRate, blockTime);

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
        poolType: PoolType.ERC20_POOL,
        poolRewardRate: new Fraction(rewardRate.toString()),
        userApr: userApr,
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
  ]);
}

/**
 * its wrapper hook to check which hook need to use based on subgraph on off
 * @returns
 */

export function useHederaPangochef() {
  const shouldUseSubgraph = useShouldUseSubgraph();
  const useHook = shouldUseSubgraph ? useGetPangoChefInfosViaSubgraph : useHederaPangoChefInfos;
  const res = useHook();
  return res;
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
  const refetchPangochefSubgraph = useRefetchPangoChefSubgraph();

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

            await refetchPangochefSubgraph();
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
  const refetchPangochefSubgraph = useRefetchPangoChefSubgraph();
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

            await refetchPangochefSubgraph();
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
  const refetchPangochefSubgraph = useRefetchPangoChefSubgraph();
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
            await refetchPangochefSubgraph();
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
  const refetchPangochefSubgraph = useRefetchPangoChefSubgraph();
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

            await refetchPangochefSubgraph();
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

/* eslint-enable max-lines */
