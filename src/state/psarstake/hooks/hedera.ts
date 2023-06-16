/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { Fraction, JSBI } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useSubgraphSarPositions, useSubgraphStakingContractInfo } from 'src/apollo/singleStake';
import { BIGNUMBER_ZERO } from 'src/constants';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useLastBlockTimestampHook } from 'src/hooks/block';
import { MixPanelEvents } from 'src/hooks/mixpanel';
import { useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import { useHederaSarNFTContract, useSarStakingContract } from 'src/hooks/useContract';
import { useShouldUseSubgraph } from 'src/state/papplication/hooks';
import { calculateUserRewardRate } from 'src/state/ppangoChef/utils';
import { existSarContract } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { useSingleContractMultipleData } from '../../pmulticall/hooks';
import { Position, URI } from '../types';
import { formatPosition, useDefaultSarClaimOrCompound, useDefaultSarStake, useDefaultSarUnstake } from '../utils';

export function useHederaExchangeRate() {
  return useQuery(
    'get-hedera-exchange-rate',
    async () => {
      const rate = await hederaFn.getExchangeRate();
      return rate;
    },
    {
      cacheTime: 10 * 1000, // 10 seconds
    },
  );
}

/**
 * This hook return the rent value of a position
 * @param positionId The id of position
 * Returns rent value in tiny bars
 */
export function useHederaSarRent(position: Position | undefined | null) {
  const chainId = useChainId();

  const useGetBlockTimestamp = useLastBlockTimestampHook[chainId];
  const blockTimestamp = useGetBlockTimestamp();

  const { data: exchangeRate, isLoading } = useHederaExchangeRate();

  /*
    rentTime = block.timestamp - position.lastUpdate;
    rentAmount = rentTime * tinyCentsToTinyBars(500_000_000) / (90 days/s);
  */

  return useMemo(() => {
    if (!position || !blockTimestamp || isLoading || !exchangeRate) {
      return undefined;
    }

    try {
      const tinyBars = hederaFn.tinyCentsToTinyBars('500000000', exchangeRate.current_rate);
      const rentTime = BigNumber.from(blockTimestamp).sub(position.lastUpdate);
      const days = 90 * 24 * 60 * 60;
      const rentAmount = JSBI.divide(
        JSBI.multiply(JSBI.BigInt(rentTime.toString()), JSBI.BigInt(tinyBars)),
        JSBI.BigInt(days.toString()),
      );
      const finalValue = new Fraction('12', '10').multiply(rentAmount);
      return finalValue.equalTo('0') ? '0' : finalValue.toFixed(0);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }, [position, blockTimestamp, exchangeRate]);
}

/**
 *
 * @param positionId Id of a Position
 * @returns Return some utils functions for stake more or create a new Position
 */
export function useDerivativeHederaSarStake(position?: Position | null) {
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

  const sarNftContract = useHederaSarNFTContract();

  const { data: exchangeRate, isLoading: isloadingExchangeRate } = useHederaExchangeRate();

  const { hederaAssociated: isAssociated } = useHederaTokenAssociated(sarNftContract?.address, 'Pangolin Sar NFT');

  const queryClient = useQueryClient();

  const onStake = async () => {
    if (!sarStakingContract || !parsedAmount || !account || !exchangeRate || !isAssociated) {
      return;
    }
    setAttempting(true);
    try {
      const response = await hederaFn.sarStake({
        methodName: !position ? 'mint' : 'stake',
        amount: parsedAmount.raw.toString(),
        chainId: chainId,
        account: account,
        positionId: position?.id?.toString(),
        rent: '0',
      });

      if (response) {
        addTransaction(response, {
          summary: t('sarStake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
        });
        setHash(response.hash);
        mixpanel.track(MixPanelEvents.SAR_STAKE, {
          chainId: chainId,
          isNewPosition: !position?.id,
        });
        await queryClient.refetchQueries(['hedera-nft-index', account, sarNftContract?.address]);
      } else {
        throw new Error('Error sending transaction');
      }
    } catch (err) {
      // we only care if the error is something _other_ than the user rejected the tx
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
        setStakeError(_err?.message);
      }
      //show other error
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
      position,
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
      isAssociated,
      exchangeRate,
      isloadingExchangeRate,
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
export function useDerivativeHederaSarUnstake(position: Position | null) {
  const {
    account,
    addTransaction,
    attempting,
    chainId,
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

  const sarNftContract = useHederaSarNFTContract();
  const queryClient = useQueryClient();

  const onUnstake = async () => {
    if (!sarStakingContract || !parsedAmount || !position || !account) {
      return;
    }
    setAttempting(true);

    try {
      const response = await hederaFn.sarUnstake({
        amount: parsedAmount.raw.toString(),
        chainId: chainId,
        account: account,
        rent: '0',
        positionId: position.id.toString(),
      });
      if (response) {
        addTransaction(response, {
          summary: t('sarUnstake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
        });
        setHash(response.hash);
        await queryClient.refetchQueries(['hedera-nft-index', account, sarNftContract?.address]);
      } else {
        throw new Error('Error sending transaction');
      }
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
      chainId,
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

export function useDerivativeHederaSarCompound(position: Position | null) {
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

  const chainId = useChainId();

  const sarNftContract = useHederaSarNFTContract();
  const queryClient = useQueryClient();
  const onCompound = async () => {
    if (!sarStakingContract || !position || !account) {
      return;
    }
    setAttempting(true);
    try {
      const response = await hederaFn.sarHarvestOrCompound(
        {
          account: account,
          chainId: chainId,
          positionId: position.id.toString(),
          rent: '0',
        },
        'compound',
      );
      if (response) {
        addTransaction(response, {
          summary: t('sarCompound.transactionSummary'),
        });
        setHash(response.hash);
        await queryClient.refetchQueries(['hedera-nft-index', account, sarNftContract?.address]);
      } else {
        throw new Error('Error sending transaction');
      }
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

export function useDerivativeHederaSarClaim(position: Position | null) {
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

  const chainId = useChainId();

  const sarNftContract = useHederaSarNFTContract();
  const queryClient = useQueryClient();

  const onClaim = async () => {
    if (!sarStakingContract || !position || !account) {
      return;
    }
    setAttempting(true);
    try {
      const response = await hederaFn.sarHarvestOrCompound(
        {
          account: account,
          chainId: chainId,
          positionId: position.id.toString(),
          rent: '0',
        },
        'harvest',
      );
      if (response) {
        addTransaction(response, {
          summary: t('sarClaim.transactionSummary'),
        });
        setHash(response.hash);
        await queryClient.refetchQueries(['hedera-nft-index', account, sarNftContract?.address]);
      } else {
        throw new Error('Error sending transaction');
      }
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
 * @returns Return an objetct with nfts id in hex string (0x1, 0x2, 0x3, ...) and nfts uris
 */
export function useHederaSarNftsIds() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarNFTcontract = useHederaSarNFTContract();

  const { data, isLoading, isRefetching } = useQuery(
    ['hedera-nft-index', account, chainId, sarNFTcontract?.address],
    async () => {
      if (!sarNFTcontract) return { nftsIndexes: [], nftsURIs: [] };

      const nfts = await hederaFn.getNftInfo(sarNFTcontract?.address, account);
      const _nftsIndexes: string[][] = [];
      const _nftURIs: (string | undefined)[] = [];

      nfts.sort((a, b) => a.serial_number - b.serial_number);

      nfts.forEach((nft) => {
        _nftsIndexes.push([`0x${nft.serial_number.toString(16)}`]);
        // the metadata from this endpoint is returned in encoded in base64
        _nftURIs.push(Buffer.from(nft.metadata, 'base64').toString());
      });

      return { nftsIndexes: _nftsIndexes, nftsURIs: _nftURIs };
    },
    {
      cacheTime: 60 * 1 * 1000, // 1 minute
    },
  );

  return { data, isLoading, isRefetching };
}

/**
 * This hooks get the user positions from SAR Single Stake via contract calls
 * @returns Return if is loading and an array with alls positions of an user
 */
export function useHederaSarPositionsViaContract() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();

  const { data, isLoading: isLoadingIndexes, isRefetching: isRefetchingIndexes } = useHederaSarNftsIds();

  const nftsIndexes = data?.nftsIndexes;
  const nftsURIs = data?.nftsURIs;

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

  const useGetBlockTimestamp = useLastBlockTimestampHook[chainId];
  const blockTimestamp = useGetBlockTimestamp();

  return useMemo(() => {
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
      !isAllFetchedInfos ||
      !isAllFetchedRewardRate ||
      !isAllFetchedPendingReward ||
      isLoadingIndexes ||
      isRefetchingIndexes;

    // first moments loading is false and valid is false then is loading the query is true
    const isValid = isValidInfos && isValidRewardRates && isValidPendingRewards;
    const error = existErrorInfos || existErrorRewardRate || existErrorPendingReward;

    if (error || !account || !existSarContract(chainId) || (!!nftsIndexes && nftsIndexes.length === 0)) {
      return { positions: [] as Position[], isLoading: false };
    }

    // if is loading or exist error or not exist account return empty array
    if (isLoading || !isValid || !nftsIndexes || !nftsURIs) {
      return { positions: [] as Position[], isLoading: true };
    }

    // we need to decode the base64 uri to get the real uri
    const _nftsURIs = nftsURIs.map((uri) => {
      if (!uri || uri.length === 0) {
        return undefined;
      }
      //need to remove the data:application/json;base64, to decode the base64
      const nftUri = Buffer.from(uri.replace('data:application/json;base64,', ''), 'base64').toString();
      return JSON.parse(nftUri) as URI;
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
      nftsURIs: _nftsURIs,
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
    positionsInfosState,
    positionsRewardRateState,
    positionsPedingRewardsState,
    nftsURIs,
    nftsIndexes,
    isLoadingIndexes,
    isRefetchingIndexes,
  ]);
}

/**
 * This hooks get the user positions from SAR Single Stake via subgraph
 * @returns Return if is loading and an array with alls positions of an user
 */
export function useHederaSarPositionsViaSubgraph() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();

  const { data, isLoading: isLoadingIndexes, isRefetching: isRefetchingIndexes } = useHederaSarNftsIds();

  const nftsIndexes = data?.nftsIndexes;
  const nftsURIs = data?.nftsURIs;

  const positionsIds = (nftsIndexes || []).map((nftIndex) => nftIndex[0]);
  const {
    data: subgraphPositions,
    isLoading: isLoadingSubgraph,
    isRefetching: isRefetchingSubgraph,
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

  const useGetBlockTimestamp = useLastBlockTimestampHook[chainId];
  const blockTimestamp = useGetBlockTimestamp();

  return useMemo(() => {
    const isAllFetchedPendingReward = positionsPedingRewardsState.every((result) => !result.loading);
    const isValidPendingRewards = positionsPedingRewardsState.every((result) => result.valid);

    const isLoading =
      !isAllFetchedPendingReward ||
      isLoadingIndexes ||
      isRefetchingIndexes ||
      isLoadingSubgraph ||
      isLoadingContractInfo ||
      isRefetchingContractInfo ||
      isRefetchingSubgraph;

    // first moments loading is false and valid is false then is loading the query is true
    const isValid = isValidPendingRewards;

    if (
      !account ||
      !existSarContract(chainId) ||
      (!!nftsIndexes && nftsIndexes.length === 0) ||
      !subgraphStakingContractInfo ||
      (subgraphPositions && subgraphPositions.length == 0)
    ) {
      return { positions: [] as Position[], isLoading: false };
    }

    // if is loading or exist error or not exist account return empty array
    if (isLoading || !isValid || !nftsIndexes || !nftsURIs || !subgraphPositions) {
      return { positions: [] as Position[], isLoading: true };
    }

    // we need to decode the base64 uri to get the real uri
    const _nftsURIs = nftsURIs.map((uri) => {
      if (!uri || uri.length === 0) {
        return undefined;
      }
      //need to remove the data:application/json;base64, to decode the base64
      const nftUri = Buffer.from(uri.replace('data:application/json;base64,', ''), 'base64').toString();
      return JSON.parse(nftUri) as URI;
    });

    subgraphPositions.sort((a, b) => Number(a.id) - Number(b.id));

    const valuesVariables = subgraphPositions.map((position) => ({
      balance: BigNumber.from(position.balance),
      sumOfEntryTimes: BigNumber.from(position.sumOfEntryTimes),
    }));

    const rewardRates = subgraphPositions.map((position) => {
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
      nftsURIs: _nftsURIs,
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
    positionsPedingRewardsState,
    nftsURIs,
    nftsIndexes,
    isLoadingIndexes,
    isRefetchingIndexes,
    subgraphPositions,
  ]);
}

export function useHederaSarPositions() {
  const shouldUseSubgraph = useShouldUseSubgraph();

  const useHook = shouldUseSubgraph ? useHederaSarPositionsViaSubgraph : useHederaSarPositionsViaContract;

  const res = useHook();
  return res;
}
