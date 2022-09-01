/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { CHAINS, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_TWO, BIG_INT_ZERO, ZERO_ADDRESS } from 'src/constants';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { PANGOLIN_PAIR_INTERFACE } from 'src/constants/abis/pangolinPair';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import { DAIe, PNG, USDC, USDCe, USDTe } from 'src/constants/tokens';
import { PairState, usePair, usePairs } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useTokens } from 'src/hooks/Tokens';
import { usePangoChefContract } from 'src/hooks/useContract';
import { usePairsCurrencyPrice } from 'src/hooks/useCurrencyPrice';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice';
import { useMultipleContractSingleData, useSingleCallResult, useSingleContractMultipleData } from '../pmulticall/hooks';
import { calculateTotalStakedAmountInAvax, calculateTotalStakedAmountInAvaxFromPng } from '../pstake/hooks';
import { PangoChefInfo, Pool, PoolType, RewardSummations, UserInfo, ValueVariables } from './types';

export function usePangoChefInfos() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();

  const png = PNG[chainId];

  // get the length of pools
  const poolLenght: BigNumber | undefined = useSingleCallResult(pangoChefContract, 'poolsLength').result?.[0];
  // create array with length of pools
  const poolsIds = new Array(poolLenght?.toBigInt() || 0).fill(0).map((_, index) => [index.toString()]);

  const poolsState = useSingleContractMultipleData(pangoChefContract, 'pools', poolsIds);
  // format the data to Pool type
  const pools = useMemo(() => {
    return poolsState.map((callState) => {
      const result = callState?.result;
      if (!result) {
        return {} as Pool;
      }
      const tokenOrRecipient = result.tokenOrRecipient;
      const poolType = result.poolType as PoolType;
      const rewarder = result.rewarder;
      const rewardPair = result.rewardPair;
      const valueVariables = result.valueVariables as ValueVariables;
      const rewardSummations = result.rewardSummationsStored as RewardSummations;

      if (!tokenOrRecipient || !poolType || !rewarder || !rewardPair || !valueVariables || !rewardSummations) {
        return {} as Pool;
      }

      return {
        tokenOrRecipient: tokenOrRecipient,
        poolType: poolType,
        rewarder: rewarder,
        rewardPair: rewardPair,
        valueVariables: {
          balance: valueVariables?.balance,
          sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
        } as ValueVariables,
        rewardSummations: rewardSummations as RewardSummations,
      } as Pool;
    });
  }, [poolsState]);

  // get reward rates for each pool
  const poolsRewardsRateState = useSingleContractMultipleData(pangoChefContract, 'poolRewardRate', poolsIds);

  // get total reward rate
  const totalRewardRateState = useSingleCallResult(pangoChefContract, 'rewardRate');
  const totalRewardRate: BigNumber = totalRewardRateState?.result?.[0] ?? BigNumber.from(0);
  const totalRewardRatePerSecond = new TokenAmount(png, totalRewardRate.toString());
  const totalRewardRatePerWeek = new TokenAmount(png, totalRewardRate.mul(60 * 60 * 24 * 7).toString());
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
        } as UserInfo;
      }
      return {
        valueVariables: {
          balance: valueVariables?.balance,
          sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
        } as ValueVariables,
        rewardSummations: rewardSummations as RewardSummations,
        previousValues: previousValues,
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
  const usdPriceTmp = useUSDCPrice(wavax);
  const usdPrice = CHAINS[chainId]?.mainnet ? usdPriceTmp : undefined;

  const pairsToGetPrice = useMemo(() => {
    const _pairs: { pair: Pair; totalSupply: TokenAmount }[] = [];
    pairs.map(([, pair], index) => {
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
        totalRewardRateState.loading ||
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

      const totalSupply = new TokenAmount(pair.liquidityToken, JSBI.BigInt(pairTotalSupplyState?.result?.[0]));

      const userInfo = userInfos[index];
      const userTotalStakedAmount = new TokenAmount(
        pair.liquidityToken,
        JSBI.BigInt(userInfo?.valueVariables.balance ?? 0),
      );

      const pendingRewards = new TokenAmount(png, JSBI.BigInt(userPendingRewardState?.result?.[0] ?? 0));

      const isAvaxPool = Boolean(pair.involvesToken(wavax));
      const isPngPool = Boolean(pair.involvesToken(png));

      // calculate the total staked amount in usd
      let totalStakedInUsd = new TokenAmount(DAIe[chainId], BIG_INT_ZERO);
      let totalStakedInWavax = new TokenAmount(wavax, BIG_INT_ZERO);

      if (totalSupply.equalTo(BIG_INT_ZERO)) {
        // Default to 0 values above avoiding division by zero errors
      } else if (pair.involvesToken(DAIe[chainId])) {
        const pairValueInDAI = JSBI.multiply(pair.reserveOfToken(DAIe[chainId]).raw, BIG_INT_TWO);
        const stakedValueInDAI = JSBI.divide(JSBI.multiply(pairValueInDAI, totalStakedAmount.raw), totalSupply.raw);
        totalStakedInUsd = new TokenAmount(DAIe[chainId], stakedValueInDAI);
      } else if (pair.involvesToken(USDCe[chainId])) {
        const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCe[chainId]).raw, BIG_INT_TWO);
        const stakedValueInUSDC = JSBI.divide(JSBI.multiply(pairValueInUSDC, totalStakedAmount.raw), totalSupply.raw);
        totalStakedInUsd = new TokenAmount(USDCe[chainId], stakedValueInUSDC);
      } else if (pair.involvesToken(USDC[chainId])) {
        const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDC[chainId]).raw, BIG_INT_TWO);
        const stakedValueInUSDC = JSBI.divide(JSBI.multiply(pairValueInUSDC, totalStakedAmount.raw), totalSupply.raw);
        totalStakedInUsd = new TokenAmount(USDC[chainId], stakedValueInUSDC);
      } else if (pair.involvesToken(USDTe[chainId])) {
        const pairValueInUSDT = JSBI.multiply(pair.reserveOfToken(USDTe[chainId]).raw, BIG_INT_TWO);
        const stakedValueInUSDT = JSBI.divide(JSBI.multiply(pairValueInUSDT, totalStakedAmount.raw), totalSupply.raw);
        totalStakedInUsd = new TokenAmount(USDTe[chainId], stakedValueInUSDT);
      } else if (isAvaxPool) {
        const _totalStakedInWavax = calculateTotalStakedAmountInAvax(
          totalStakedAmount.raw,
          totalSupply.raw,
          pair.reserveOfToken(wavax).raw,
          chainId,
        );
        totalStakedInUsd = _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount);
        totalStakedInWavax = _totalStakedInWavax;
      } else if (isPngPool) {
        const _totalStakedInWavax = calculateTotalStakedAmountInAvaxFromPng(
          totalStakedAmount.raw,
          totalSupply.raw,
          avaxPngPair.reserveOfToken(png).raw,
          avaxPngPair.reserveOfToken(wavax).raw,
          pair.reserveOfToken(png).raw,
          chainId,
        );
        totalStakedInUsd = _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount);
        totalStakedInWavax = _totalStakedInWavax;
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
      // userAPR = userRewardRate(POOL_ID, USER_ADDRESS) * 365 days * 100 * PNG_PRICE / (getUser(POOL_ID, USER_ADDRESS).valueVariables.balance * STAKING_TOKEN_PRICE)
      const pairPrice = pairPrices[pair.liquidityToken.address];
      const pngPrice = avaxPngPair.priceOf(png, wavax);
      const apr =
        pool.valueVariables.balance.isZero() || pairPrice.equalTo('0')
          ? 0
          : Number(
              pngPrice.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .divide(pairPrice.raw.multiply(pool.valueVariables.balance.toString()))
                .toSignificant(2),
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
        rewardRatePerWeek: new TokenAmount(png, rewardRate.mul(60 * 60 * 24 * 7).toString()),
        getHypotheticalWeeklyRewardRate: getHypotheticalWeeklyRewardRate,
        earnedAmount: pendingRewards,
        valueVariables: pool.valueVariables,
        userValueVariables: userInfo?.valueVariables,
        userRewardRate: userRewardRateState.result?.[0] ?? BigNumber.from(0),
        stakingApr: apr,
        pairPrice: pairPrice,
        poolType: pool.poolType,
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
