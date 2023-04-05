/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { CHAINS, ChainId, Fraction, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_ZERO, ZERO_ADDRESS, ZERO_FRACTION } from 'src/constants';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { PANGOLIN_PAIR_INTERFACE } from 'src/constants/abis/pangolinPair';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import { PNG, USDC } from 'src/constants/tokens';
import { PairState, usePair, usePairs } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3, useRefetchMinichefSubgraph } from 'src/hooks';
import { useLastBlockTimestampHook } from 'src/hooks/block';
import { useTokens } from 'src/hooks/tokens/evm';
import { usePangoChefContract, useStakingContract } from 'src/hooks/useContract';
import { usePairsCurrencyPrice } from 'src/hooks/useCurrencyPrice';
import { useCoinGeckoCurrencyPrice } from 'src/state/pcoingecko/hooks';
import { useMinichefPools } from 'src/state/pstake/hooks/common';
import { getExtraTokensWeeklyRewardRate } from 'src/state/pstake/utils';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { calculateGasMargin, decimalToFraction, waitForTransaction } from 'src/utils';
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../../pmulticall/hooks';
import { PangoChefCompoundData, PangoChefInfo, Pool, PoolType, UserInfo, ValueVariables, WithdrawData } from '../types';
import { calculateCompoundSlippage, calculateUserAPR, calculateUserRewardRate } from '../utils';

export function usePangoChefInfos() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();

  const useGetBlockTimestamp = useLastBlockTimestampHook[chainId];
  const blockTime = useGetBlockTimestamp();

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

      const _pairPrice = pairPrices[pair?.liquidityToken?.address];
      const pairPrice = _pairPrice ? _pairPrice.raw : ZERO_FRACTION;
      const pngPrice = avaxPngPair.priceOf(png, wavax);

      const _totalStakedInWavax = pairPrice.multiply(totalStakedAmount?.raw) ?? ZERO_FRACTION;

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

      const expoent = png.decimals - pair?.liquidityToken.decimals;

      // poolAPR = poolRewardRate(POOL_ID) * 365 days * 100 * PNG_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      const apr =
        pool?.valueVariables?.balance.isZero() || pairPrice?.equalTo('0') || !pairPrice
          ? 0
          : Number(
              pngPrice?.raw
                .multiply(rewardRate.mul(365 * 86400 * 100).toString())
                .divide(
                  pairPrice
                    .multiply(pool?.valueVariables?.balance?.toString())
                    .multiply(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(expoent))),
                )
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
        pairPrice,
        pngPrice,
        png,
        userRewardRate,
        stakedAmount: userTotalStakedAmount,
      });

      farms.push({
        pid: pid,
        tokens: [pair.token0, pair.token1],
        stakingRewardAddress: pangoChefContract?.address ?? '',
        totalStakedAmount: totalStakedAmount,
        totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDC[chainId], BIG_INT_ZERO),
        totalStakedInWavax: totalStakedInWavax,
        multiplier: weight ? JSBI.BigInt(weight.toString()) : BIG_INT_ZERO,
        stakedAmount: userTotalStakedAmount,
        isPeriodFinished: rewardRate.isZero(),
        periodFinish: undefined,
        rewardsAddress: pool.rewarder,
        rewardTokensAddress: [...(rewardTokensState?.result?.[0] || [])],
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
        userRewardRate: userRewardRate,
        stakingApr: apr,
        pairPrice: pairPrice,
        poolType: pool.poolType,
        poolRewardRate: new Fraction(rewardRate.toString()),
        userApr: userApr,
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

/* eslint-enable max-lines */
