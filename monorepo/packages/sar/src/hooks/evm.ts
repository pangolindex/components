/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { TokenAmount } from '@pangolindex/sdk';
import {
  BIGNUMBER_ZERO,
  MixPanelEvents,
  PNG,
  calculateGasMargin,
  calculateUserRewardRate,
  existSarContract,
  useChainId,
  usePangolinWeb3,
  useSubgraphSarPositions,
  useSubgraphStakingContractInfo,
  waitForTransaction,
} from '@pangolindex/shared';
import {
  useLastBlockTimestampHook,
  useSarStakingContract,
  useShouldUseSubgraph,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '@pangolindex/state-hooks';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { Position, URI } from './types';
import { formatPosition, useDefaultSarClaimOrCompound, useDefaultSarStake, useDefaultSarUnstake } from './utils';

// Return the info of the sar stake
export function useSarStakeInfo() {
  const chainId = useChainId();
  const sarStakingContract = useSarStakingContract();
  const png = PNG[chainId];

  const rewardRate: BigNumber | undefined = useSingleCallResult(sarStakingContract, 'rewardRate').result?.[0];
  const totalValueVariables = useSingleCallResult(sarStakingContract, 'totalValueVariables')?.result;

  return useMemo(() => {
    const apr =
      rewardRate && totalValueVariables && totalValueVariables?.balance && !totalValueVariables.balance.isZero()
        ? rewardRate.mul(86400).mul(365).mul(100).div(totalValueVariables.balance)
        : null;
    const totalStaked = new TokenAmount(png, totalValueVariables ? totalValueVariables?.balance.toString() : '0');

    const weeklyPNG = !!rewardRate ? rewardRate.mul(86400).mul(7) : BIGNUMBER_ZERO;

    const sumOfEntryTimes: BigNumber = totalValueVariables ? totalValueVariables?.sumOfEntryTimes : BIGNUMBER_ZERO;

    return { apr, totalStaked, sumOfEntryTimes, rewardRate: rewardRate ?? BIGNUMBER_ZERO, weeklyPNG };
  }, [rewardRate, totalValueVariables]);
}

/**
 *
 * @param positionId Id of a Position
 * @returns Return some utils functions for stake more or create a new Position
 */
export function useDerivativeSarStake(position?: Position | null) {
  const {
    account,
    addTransaction,
    approval,
    approveCallback,
    attempting,
    chainId,
    dollerWorth,
    error,
    handleMax,
    hash,
    mixpanel,
    onChangePercentage,
    onUserInput,
    parsedAmount,
    png,
    sarStakingContract,
    setAttempting,
    setHash,
    setStakeError,
    setStepIndex,
    stakeError,
    stepIndex,
    t,
    typedValue,
    wrappedOnDismiss,
  } = useDefaultSarStake();

  const onStake = async () => {
    if (!sarStakingContract || !parsedAmount) {
      return;
    }
    setAttempting(true);
    try {
      let response: TransactionResponse;
      if (!position) {
        const estimatedGas = await sarStakingContract.estimateGas.mint(`0x${parsedAmount.raw.toString(16)}`);
        // create a new position
        response = await sarStakingContract.mint(`0x${parsedAmount.raw.toString(16)}`, {
          gasLimit: calculateGasMargin(estimatedGas),
        });
      } else {
        const estimatedGas = await sarStakingContract.estimateGas.stake(
          position.id.toHexString(),
          `0x${parsedAmount.raw.toString(16)}`,
        );
        // adding more png to an existing position
        response = await sarStakingContract.stake(position.id.toHexString(), `0x${parsedAmount.raw.toString(16)}`, {
          gasLimit: calculateGasMargin(estimatedGas),
        });
      }
      await waitForTransaction(response, 3);
      addTransaction(response, {
        summary: t('sarStake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
      });
      setHash(response.hash);
      mixpanel.track(MixPanelEvents.SAR_STAKE, {
        chainId: chainId,
        isNewPosition: !position,
      });
    } catch (err) {
      // we only care if the error is something _other_ than the user rejected the tx
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
        setStakeError(_err?.message);
      }
    } finally {
      setAttempting(false);
    }
  };

  return useMemo(
    () => ({
      attempting,
      typedValue,
      parsedAmount,
      hash,
      stepIndex,
      dollerWorth,
      error,
      approval,
      account,
      png,
      stakeError,
      onAttemptToApprove: approveCallback,
      onUserInput,
      wrappedOnDismiss,
      handleMax,
      onStake,
      onChangePercentage,
      setStepIndex,
    }),
    [
      attempting,
      typedValue,
      parsedAmount,
      hash,
      stepIndex,
      dollerWorth,
      error,
      approval,
      account,
      sarStakingContract,
      approveCallback,
      onUserInput,
      handleMax,
    ],
  );
}

/**
 *
 * @param position Id of a Posttion
 * @returns Return some utils functions for unstake
 */
export function useDerivativeSarUnstake(position: Position | null) {
  const {
    account,
    addTransaction,
    attempting,
    error,
    handleMax,
    hash,
    onChangePercentage,
    onUserInput,
    parsedAmount,
    png,
    sarStakingContract,
    setAttempting,
    setHash,
    setStepIndex,
    setUnstakeError,
    stepIndex,
    t,
    typedValue,
    unstakeError,
    wrappedOnDismiss,
  } = useDefaultSarUnstake(position);

  const onUnstake = async () => {
    if (!sarStakingContract || !parsedAmount || !position) {
      return;
    }
    setAttempting(true);
    try {
      const estimatedGas = await sarStakingContract.estimateGas.withdraw(
        position.id.toHexString(),
        `0x${parsedAmount.raw.toString(16)}`,
      );
      const response: TransactionResponse = await sarStakingContract.withdraw(
        position.id.toHexString(),
        `0x${parsedAmount.raw.toString(16)}`,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
      await waitForTransaction(response, 3);
      addTransaction(response, {
        summary: t('sarUnstake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
      });
      setHash(response.hash);
    } catch (err) {
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
        setUnstakeError(_err?.message);
      }
    } finally {
      setAttempting(false);
    }
  };

  return useMemo(
    () => ({
      attempting,
      hash,
      stepIndex,
      typedValue,
      parsedAmount,
      error,
      unstakeError,
      onUserInput,
      wrappedOnDismiss,
      handleMax,
      onUnstake,
      onChangePercentage,
      setStepIndex,
    }),
    [
      attempting,
      typedValue,
      parsedAmount,
      hash,
      stepIndex,
      error,
      account,
      sarStakingContract,
      onUserInput,
      handleMax,
      position,
    ],
  );
}

export function useDerivativeSarCompound(position: Position | null) {
  const {
    account,
    addTransaction,
    attempting,
    functionError: compoundError,
    hash,
    sarStakingContract,
    setAttempting,
    setFunctionError: setCompoundError,
    setHash,
    t,
    wrappedOnDismiss,
  } = useDefaultSarClaimOrCompound();

  const onCompound = async () => {
    if (!sarStakingContract || !position) {
      return;
    }
    setAttempting(true);
    try {
      const estimatedGas = await sarStakingContract.estimateGas.compound(position.id.toHexString());
      const response: TransactionResponse = await sarStakingContract.compound(position.id.toHexString(), {
        gasLimit: calculateGasMargin(estimatedGas),
      });
      await waitForTransaction(response, 3);
      addTransaction(response, {
        summary: t('sarCompound.transactionSummary'),
      });
      setHash(response.hash);
    } catch (error) {
      const err = error as any;
      if (err?.code !== 4001) {
        console.error(err);
        setCompoundError(err?.message);
      }
    } finally {
      setAttempting(false);
    }
  };

  return useMemo(
    () => ({
      attempting,
      hash,
      compoundError,
      wrappedOnDismiss,
      onCompound,
    }),
    [sarStakingContract, attempting, hash, account, position],
  );
}

export function useDerivativeSarClaim(position: Position | null) {
  const {
    account,
    addTransaction,
    attempting,
    functionError: claimError,
    hash,
    sarStakingContract,
    setAttempting,
    setFunctionError: setClaimError,
    setHash,
    t,
    wrappedOnDismiss,
  } = useDefaultSarClaimOrCompound();

  const onClaim = async () => {
    if (!sarStakingContract || !position) {
      return;
    }
    setAttempting(true);
    try {
      const estimatedGas = await sarStakingContract.estimateGas.harvest(position.id.toHexString());
      const response: TransactionResponse = await sarStakingContract.harvest(position.id.toHexString(), {
        gasLimit: calculateGasMargin(estimatedGas),
      });
      await waitForTransaction(response, 3);
      addTransaction(response, {
        summary: t('sarClaim.transactionSummary'),
      });
      setHash(response.hash);
    } catch (error) {
      const err = error as any;
      if (err?.code !== 4001) {
        console.error(err);
        setClaimError(err?.message);
      }
    } finally {
      setAttempting(false);
    }
  };

  return useMemo(
    () => ({
      attempting,
      hash,
      claimError,
      wrappedOnDismiss,
      onClaim,
    }),
    [sarStakingContract, attempting, hash, account, position],
  );
}

/**
 * This hook return a list of id of an account
 * @returns Return an array with nfts id in hex string (0x1, 0x2, 0x3, ...)
 */
export function useSarNftsIds() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const sarStakingContract = useSarStakingContract();

  const {
    data: nftsIndexes,
    isLoading,
    isRefetching,
  } = useQuery(
    ['get-nfts-indexes', sarStakingContract?.address, chainId, account],
    async () => {
      if (!sarStakingContract) return [] as string[][];

      const balance: BigNumber = await sarStakingContract.balanceOf(account);

      if (balance.isZero()) {
        return [] as string[][];
      }

      // get all positions ids
      const indexes: BigNumber[] = await sarStakingContract.tokensOfOwnerByIndex(
        account,
        BIGNUMBER_ZERO.toHexString(),
        balance.sub(1).toHexString(),
      );

      return indexes
        ?.map((index) => {
          return [index.toHexString()];
        })
        .sort((a, b) => Number(a) - Number(b));
    },
    {
      refetchInterval: 1000 * 60 * 1, // 1 minute
    },
  );

  return { nftsIndexes, isLoading, isRefetching };
}

/**
 * This hook get the user positions from SAR Single Stake via contract calls
 * @returns Return if is loading and an array with alls positions of an user
 */
export function useSarPositionsViaContracts() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();

  const { nftsIndexes, isLoading: isLoadingIndexes, isRefetching: isRefetchingIndexes } = useSarNftsIds();

  // get the staked amount for each position
  const positionsInfosState = useSingleContractMultipleData(sarStakingContract, 'positions', nftsIndexes ?? []);
  // get the reward rate for each position
  const positionsRewardRateState = useSingleContractMultipleData(
    sarStakingContract,
    'positionRewardRate',
    nftsIndexes ?? [],
  );

  const positionsPedingRewardsState = useSingleContractMultipleData(
    sarStakingContract,
    'positionPendingRewards',
    nftsIndexes ?? [],
  );

  //get all NFTs URIs from the positions
  const nftsURIsState = useSingleContractMultipleData(sarStakingContract, 'tokenURI', nftsIndexes ?? []);

  const useGetBlockTimestamp = useLastBlockTimestampHook[chainId];
  const blockTimestamp = useGetBlockTimestamp();

  return useMemo(() => {
    const isAllFetchedURI = nftsURIsState.every((result) => !result.loading);
    const existErrorURI = nftsURIsState.some((result) => result.error);
    const isValidURIs = nftsURIsState.every((result) => result.valid);

    const isAllFetchedInfos = positionsInfosState.every((result) => !result.loading);
    const existErrorInfos = positionsInfosState.some((result) => result.error);
    const isValidInfos = positionsInfosState.every((result) => result.valid);

    const isAllFetchedRewardRate = positionsRewardRateState.every((result) => !result.loading);
    const existErrorRewardRate = positionsRewardRateState.some((result) => result.error);
    const isValidRewardRates = positionsRewardRateState.every((result) => result.valid);

    const isAllFetchedPendingReward = positionsPedingRewardsState.every((result) => !result.loading);
    const existErrorPendingReward = positionsPedingRewardsState.some((result) => result.error);
    const isValidPendingRewards = positionsPedingRewardsState.every((result) => result.valid);

    const isLoading =
      !isAllFetchedURI ||
      !isAllFetchedInfos ||
      !isAllFetchedRewardRate ||
      !isAllFetchedPendingReward ||
      isLoadingIndexes ||
      isRefetchingIndexes;

    // first moments loading is false and valid is false then is loading the query is true
    const isValid = isValidURIs && isValidInfos && isValidRewardRates && isValidPendingRewards;

    const error = existErrorURI || existErrorInfos || existErrorRewardRate || existErrorPendingReward;

    if (error || !account || !existSarContract(chainId) || (!!nftsIndexes && nftsIndexes.length === 0)) {
      return { positions: [] as Position[], isLoading: false };
    }

    // if is loading or exist error or not exist account return empty array
    if (isLoading || !isValid || !nftsIndexes) {
      return { positions: [] as Position[], isLoading: true };
    }

    // we need to decode the base64 uri to get the real uri
    const nftsURIs = nftsURIsState.map((value) => {
      if (value.result) {
        const base64: string = value.result[0];
        //need to remove the data:application/json;base64, to decode the base64
        const nftUri = Buffer.from(base64.replace('data:application/json;base64,', ''), 'base64').toString();
        return JSON.parse(nftUri) as URI;
      }
      return undefined;
    });

    const valuesVariables = positionsInfosState.map((position) => position.result?.valueVariables);
    const lastUpdates = positionsInfosState.map((position) => BigNumber.from(position.result?.lastUpdate));

    const rewardRates: BigNumber[] = positionsRewardRateState.map((callState) =>
      callState.result ? callState.result?.[0] : BIGNUMBER_ZERO,
    );

    const pendingsRewards: BigNumber[] = positionsPedingRewardsState.map((callState) =>
      callState.result ? callState.result?.[0] : BIGNUMBER_ZERO,
    );

    const formatedPositions = formatPosition({
      nftsURIs,
      nftsIndexes,
      valuesVariables,
      rewardRates,
      pendingsRewards,
      lastUpdates,
      blockTimestamp: blockTimestamp ?? 0,
      chainId,
    });

    return { positions: formatedPositions, isLoading: false };
  }, [
    account,
    sarStakingContract,
    positionsInfosState,
    positionsRewardRateState,
    positionsPedingRewardsState,
    nftsURIsState,
    nftsIndexes,
    isLoadingIndexes,
    isRefetchingIndexes,
  ]);
}

/**
 * This hook get the user positions from SAR Single Stake via subgraph
 * @returns Return if is loading and an array with alls positions of an user
 */
export function useSarPositionsViaSubgraph() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const sarStakingContract = useSarStakingContract();

  const { nftsIndexes, isLoading: isLoadingIndexes, isRefetching: isRefetchingIndexes } = useSarNftsIds();

  const positionsIds = (nftsIndexes || []).map((nftIndex) => nftIndex[0]);
  const {
    data: subgraphPositions,
    isLoading: isLoadingSubgraphPositions,
    isRefetching: isRefetchingSubgraphPositions,
  } = useSubgraphSarPositions(positionsIds);
  const {
    data: subgraphStakingContractInfo,
    isLoading: isLoadingContractInfo,
    isRefetching: isRefetchingContractInfo,
  } = useSubgraphStakingContractInfo();

  const positionsPedingRewardsState = useSingleContractMultipleData(
    sarStakingContract,
    'positionPendingRewards',
    nftsIndexes ?? [],
  );

  //get all NFTs URIs from the positions
  const nftsURIsState = useSingleContractMultipleData(sarStakingContract, 'tokenURI', nftsIndexes ?? []);

  const useGetBlockTimestamp = useLastBlockTimestampHook[chainId];
  const blockTimestamp = useGetBlockTimestamp();

  return useMemo(() => {
    const isAllFetchedURI = nftsURIsState.every((result) => !result.loading);
    const existErrorURI = nftsURIsState.some((result) => result.error);
    const isValidURIs = nftsURIsState.every((result) => result.valid);

    const isAllFetchedPendingReward = positionsPedingRewardsState.every((result) => !result.loading);
    const existErrorPendingReward = positionsPedingRewardsState.some((result) => result.error);
    const isValidPendingRewards = positionsPedingRewardsState.every((result) => result.valid);

    const isLoading =
      !isAllFetchedURI ||
      !isAllFetchedPendingReward ||
      isLoadingIndexes ||
      isRefetchingIndexes ||
      isLoadingSubgraphPositions ||
      isLoadingContractInfo ||
      isRefetchingContractInfo ||
      isRefetchingSubgraphPositions;

    // first moments loading is false and valid is false then is loading the query is true
    const isValid = isValidURIs && isValidPendingRewards;

    const error = existErrorURI || existErrorPendingReward;

    if (error || !account || !existSarContract(chainId) || (!!nftsIndexes && nftsIndexes.length === 0)) {
      return { positions: [] as Position[], isLoading: false };
    }

    // if is loading or exist error or not exist account return empty array
    if (isLoading || !isValid || !nftsIndexes || !subgraphPositions) {
      return { positions: [] as Position[], isLoading: true };
    }

    subgraphPositions.sort((a, b) => Number(a.id) - Number(b.id));

    // we need to decode the base64 uri to get the real uri
    const nftsURIs = nftsURIsState.map((value) => {
      if (value.result) {
        const base64: string = value.result[0];
        //need to remove the data:application/json;base64, to decode the base64
        const nftUri = Buffer.from(base64.replace('data:application/json;base64,', ''), 'base64').toString();
        return JSON.parse(nftUri) as URI;
      }
      return undefined;
    });

    const valuesVariables = subgraphPositions?.map((position) => ({
      balance: BigNumber.from(position.balance),
      sumOfEntryTimes: BigNumber.from(position.sumOfEntryTimes),
    }));

    const rewardRates = subgraphPositions?.map((position) => {
      const userValuesVariables = {
        balance: BigNumber.from(position.balance),
        sumOfEntryTimes: BigNumber.from(position.sumOfEntryTimes),
      };
      const totalValueVariables = {
        balance: BigNumber.from(subgraphStakingContractInfo ? subgraphStakingContractInfo.balance : 0),
        sumOfEntryTimes: BigNumber.from(subgraphStakingContractInfo ? subgraphStakingContractInfo.sumOfEntryTimes : 0),
      };
      const totalRewardRate = BigNumber.from(subgraphStakingContractInfo ? subgraphStakingContractInfo.rewardRate : 0);

      const positionRewardRate = calculateUserRewardRate(
        userValuesVariables,
        totalValueVariables,
        totalRewardRate,
        blockTimestamp,
      );
      return positionRewardRate;
    });

    const pendingsRewards: BigNumber[] = positionsPedingRewardsState.map((callState) =>
      callState.result ? callState.result?.[0] : BIGNUMBER_ZERO,
    );

    const lastUpdates: BigNumber[] = (subgraphPositions || [])?.map((position) => BigNumber.from(position.lastUpdate));

    const formatedPositions = formatPosition({
      nftsURIs,
      nftsIndexes,
      valuesVariables,
      rewardRates,
      pendingsRewards,
      lastUpdates,
      blockTimestamp: blockTimestamp ?? 0,
      chainId,
    });

    return { positions: formatedPositions, isLoading: false };
  }, [
    account,
    sarStakingContract,
    positionsPedingRewardsState,
    nftsURIsState,
    nftsIndexes,
    subgraphPositions,
    subgraphStakingContractInfo,
    isLoadingIndexes,
    isRefetchingIndexes,
    isLoadingSubgraphPositions,
    isLoadingContractInfo,
    isRefetchingContractInfo,
    isRefetchingSubgraphPositions,
  ]);
}

/**
 * its wrapper hook to check which hook need to use based on subgraph on off
 * @returns if is loading and an array with sar Postions
 */
export function useSarPositions() {
  const shouldUseSubgraph = useShouldUseSubgraph();
  const useHook = shouldUseSubgraph ? useSarPositionsViaSubgraph : useSarPositionsViaContracts;

  const res = useHook();
  return res;
}
