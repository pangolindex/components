/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { Fraction, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import {
  BIG_INT_SECONDS_IN_WEEK,
  BIG_INT_ZERO,
  ERC20_INTERFACE,
  PNG,
  PairState,
  USDC,
  ZERO_ADDRESS,
  ZERO_FRACTION,
  decimalToFraction,
  useChainId,
  useLastBlockTimestampHook,
  usePangolinWeb3,
  useRefetchPangoChefSubgraph,
  useSubgraphFarmsStakedAmount,
  useTranslation,
} from '@pangolindex/shared';
import {
  useCoinGeckoCurrencyPrice,
  useMultipleContractSingleData,
  usePair,
  usePairsContract,
  usePairsCurrencyPrice,
  useShouldUseSubgraph,
  useSingleCallResult,
  useSingleContractMultipleData,
  useTokensContract,
  useTransactionAdder,
} from '@pangolindex/state-hooks';
import { Hedera, hederaFn } from '@pangolindex/wallet-connectors';
import { useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { PANGOLIN_PAIR_INTERFACE, REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis';
import { useGetExtraPendingRewards } from 'src/hooks/minichef/hooks/common';
import { getExtraTokensWeeklyRewardRate } from 'src/hooks/minichef/utils';
import { usePangoChefContract } from 'src/hooks/useContract';
import { useHederaPGLTokenAddresses, useHederaPairContractEVMAddresses } from 'src/hooks/wallet/hooks/hedera';
import { PangoChefCompoundData, PangoChefInfo, Pool, PoolType, UserInfo, ValueVariables, WithdrawData } from '../types';
import {
  calculateCompoundSlippage,
  calculateUserAPR,
  calculateUserRewardRate,
  getHypotheticalWeeklyRewardRate,
} from '../utils';
import { useGetPangoChefInfosViaSubgraph } from './subgraph';

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

  const allPglTokenAddress = useMemo(
    () =>
      pairAddresses.map((pairAddress) => {
        if (pairAddress) {
          return pglTokenAddresses[pairAddress];
        }
        return undefined;
      }),
    [pglTokenAddresses, pairAddresses],
  );

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

  const extraPendingTokensRewardsState = useGetExtraPendingRewards(rewardsAddresses, userPendingRewardsState);

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
      const rewardMultipliersState = rewardsMultipliersState[index];
      const userPendingRewardState = userPendingRewardsState[index];
      const pairTotalSupplyState = pairTotalSuppliesState[index];
      const [pairState, pair] = pairs?.[index] || [];
      const extraPendingTokensRewardState = extraPendingTokensRewardsState[index];
      const extraPendingTokensRewards = extraPendingTokensRewardState?.result as
        | { amounts: BigNumber[]; tokens: string[] }
        | undefined;

      // if is loading or not exist pair continue
      if (
        poolState?.loading ||
        poolRewardRateState?.loading ||
        userInfoState?.loading ||
        token0State?.loading ||
        token1State?.loading ||
        extraPendingTokensRewardState?.loading ||
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

      const _userRewardRate = calculateUserRewardRate(
        userInfo?.valueVariables,
        pool.valueVariables,
        rewardRate,
        blockTime,
      );

      const userRewardRate = new Fraction(_userRewardRate.toString(), '1');

      const userApr = calculateUserAPR({
        pairPrice: pairPrice,
        png,
        pngPrice,
        userRewardRate,
        stakedAmount: userTotalStakedAmount,
      });

      const { rewardTokensAddress, extraPendingRewards } = (extraPendingTokensRewards?.amounts ?? []).reduce(
        (memo, rewardAmount, index) => {
          memo.rewardTokensAddress.push(extraPendingTokensRewards?.tokens?.[index] ?? '');
          memo.extraPendingRewards.push(JSBI.BigInt(rewardAmount.toString()));
          return memo;
        },
        {
          rewardTokensAddress: [] as string[],
          extraPendingRewards: [] as JSBI[],
        },
      );

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
        rewardTokensAddress: rewardTokensAddress,
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
        poolRewardRate: new Fraction(rewardRate.toString()),
        userApr,
        extraPendingRewards: extraPendingRewards,
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
    extraPendingTokensRewardsState,
    pairTotalSuppliesState,
    userPendingRewardsState,
    pairs,
    blockTime,
  ]);
  // return [] as PangoChefInfo[];
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
    { enabled: Boolean(pangoChefContract) && Boolean(account) && Hedera.isHederaChain(chainId) },
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

  if (!Hedera.isHederaChain(chainId)) {
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
export function useHederaPangoChefClaimRewardCallback(poolId: string | null): {
  callback: null | (() => Promise<string>);
  error: string | null;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();

  const addTransaction = useTransactionAdder();

  const refetchPangochefSubgraph = useRefetchPangoChefSubgraph();
  const png = PNG[chainId];

  return useMemo(() => {
    if (!poolId || !account || !chainId) {
      return { callback: null, error: 'Missing dependencies' };
    }

    return {
      callback: async function onClaimReward(): Promise<string> {
        try {
          const args = {
            poolId,
            account,
            chainId,
            methodName: 'harvest',
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
  }, [poolId, account, chainId, addTransaction]);
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
