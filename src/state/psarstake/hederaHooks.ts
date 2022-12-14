/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { Fraction, JSBI } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useChainId, useGetBlockTimestamp, usePangolinWeb3 } from 'src/hooks';
import { useHederaTokenAssociated } from 'src/hooks/Tokens';
import { MixPanelEvents } from 'src/hooks/mixpanel';
import { useHederaSarNFTContract, useSarStakingContract } from 'src/hooks/useContract';
import { existSarContract } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { useSingleCallResult, useSingleContractMultipleData } from '../pmulticall/hooks';
import { Position, URI } from './types';
import { formatPosition, useDefaultSarStake, useDefaultSarUnstake } from './utils';

export function useHederaExchangeRate() {
  return useQuery(
    'get-hedera-exchange-rate',
    async () => {
      const rate = await hederaFn.getExchangeRate();
      return rate;
    },
    {
      cacheTime: 60 * 1000, // 1 minute
    },
  );
}

/**
 * This hook return the rent value of a position
 * @param positionId The id of position
 * Returns rent value in tiny bars
 */
function useHederaRent(positionId: string | undefined) {
  const sarStakingContract = useSarStakingContract();
  const blockTimestamp = useGetBlockTimestamp();

  const positionState = useSingleCallResult(
    positionId ? sarStakingContract : undefined,
    'positions',
    positionId ? [positionId] : [],
  );

  const { data: exchangeRate, isLoading: isLoadingRate } = useHederaExchangeRate();

  /*
    rentTime = block.timestamp - position.lastUpdate;
    rentAmount = rentTime * tinyCentsToTinyBars(500_000_000) / (90 days/s);
  */

  return useMemo(() => {
    const isLoading = isLoadingRate || positionState.loading;
    if (!positionId || !blockTimestamp || isLoading || !exchangeRate || positionState.error || !positionState.valid) {
      return undefined;
    }

    try {
      const tinyBars = hederaFn.tinyCentsToTinyBars('500000000', exchangeRate.current_rate);
      const lastUpdate = positionState.result?.lastUpdate;
      const rentTime = Number(blockTimestamp) - lastUpdate;
      const days = 90 * 24 * 60 * 60;
      const rentAmount = JSBI.divide(
        JSBI.multiply(JSBI.BigInt(rentTime.toString()), JSBI.BigInt(tinyBars)),
        JSBI.BigInt(days.toString()),
      );
      return new Fraction('12', '10').multiply(rentAmount).toFixed(0);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }, [positionId, blockTimestamp, exchangeRate, isLoadingRate, positionState, sarStakingContract]);
}

/**
 *
 * @param positionId Id of a Position
 * @returns Return some utils functions for stake more or create a new Position
 */
export function useDerivativeHederaSarStake(positionId?: BigNumber) {
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
  const tinyRentAddMore = useHederaRent(positionId?.toString());

  const {
    associate: associate,
    hederaAssociated: isAssociated,
    isLoading: isLoading,
  } = useHederaTokenAssociated(sarNftContract?.address, 'Pangolin Sar NFT');

  const onStake = async () => {
    if (!sarStakingContract || !parsedAmount || !account || isLoading || !exchangeRate) {
      return;
    }
    setAttempting(true);
    try {
      if (!isAssociated && !!associate) {
        await associate();
      }

      // double check
      if (!isAssociated) return;

      // we need to send 0.1$ in hbar amount to mint
      const tinyCents = hederaFn.convertHBarToTinyBars('10'); // 10 cents = 0.1$
      const tinyRent = hederaFn.tinyCentsToTinyBars(tinyCents, exchangeRate.current_rate);
      const tinyValue = !positionId ? tinyRent : tinyRentAddMore;
      const rent = hederaFn.convertTinyBarToHbar(tinyValue ?? '0');

      const response = await hederaFn.sarStake({
        methodName: !positionId ? 'mint' : 'stake',
        amount: parsedAmount.raw.toString(),
        chainId: chainId,
        account: account,
        positionId: positionId?.toString(),
        rent: rent,
      });

      if (response) {
        addTransaction(response, {
          summary: t('sarStake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
        });
        setHash(response.hash);
        mixpanel.track(MixPanelEvents.SAR_STAKE, {
          chainId: chainId,
          isNewPosition: !positionId,
        });
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
      isLoading,
      isAssociated,
      exchangeRate,
      isloadingExchangeRate,
      tinyRentAddMore,
      associate,
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

  const tinyRent = useHederaRent(position?.id?.toHexString());

  const onUnstake = async () => {
    if (!sarStakingContract || !parsedAmount || !position || !account || !tinyRent) {
      return;
    }
    setAttempting(true);

    const rent = hederaFn.convertTinyBarToHbar(tinyRent);

    try {
      const response = await hederaFn.sarUnstake({
        amount: parsedAmount.raw.toString(),
        chainId: chainId,
        account: account,
        rent: rent,
        positionId: position.id.toString(),
      });
      if (response) {
        addTransaction(response, {
          summary: t('sarUnstake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
        });
        setHash(response.hash);
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
      tinyRent,
      onUserInput,
      handleMax,
      position,
    ],
  );
}

// Returns a list of user positions
export function useHederaSarPositions() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const sarNFTcontract = useHederaSarNFTContract();

  const { data, isLoading: isLoadingIndexes } = useQuery(
    ['hedera-nft-index', account, sarNFTcontract?.address],
    async () => {
      const nfts = await hederaFn.getNftInfo(sarNFTcontract?.address, account);
      const _nftsIndexes: string[][] = [];
      const _nftURIs: (string | undefined)[] = [];

      nfts.forEach((nft) => {
        _nftsIndexes.push([nft.serial_number.toString()]);
        // the metadata from this endpoint is returned in encoded in base64
        _nftURIs.push(Buffer.from(nft.metadata, 'base64').toString());
      });

      return { nftsIndexes: _nftsIndexes, nftsURIs: _nftURIs };
    },
  );

  const nftsIndexes = data?.nftsIndexes;
  const nftsURIs = data?.nftsURIs;

  // get the staked amount for each position
  const positionsAmountState = useSingleContractMultipleData(sarStakingContract, 'positions', nftsIndexes ?? []);
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

  return useMemo(() => {
    const isAllFetchedAmount = positionsAmountState.every((result) => !result.loading);
    const existErrorAmount = positionsAmountState.some((result) => result.error);
    const isValidAmounts = positionsAmountState.every((result) => result.valid);

    const isAllFetchedRewardRate = positionsRewardRateState.every((result) => !result.loading);
    const existErrorRewardRate = positionsRewardRateState.some((result) => result.error);
    const isValidRewardRates = positionsRewardRateState.every((result) => result.valid);

    const isAllFetchedPendingReward = positionsPedingRewardsState.every((result) => !result.loading);
    const existErrorPendingReward = positionsPedingRewardsState.some((result) => result.error);
    const isValidPendingRewards = positionsPedingRewardsState.every((result) => result.valid);

    const isLoading = !isAllFetchedAmount || !isAllFetchedRewardRate || !isAllFetchedPendingReward || isLoadingIndexes;
    // first moments loading is false and valid is false then is loading the query is true
    const isValid = isValidAmounts && isValidRewardRates && isValidPendingRewards;

    const error = existErrorAmount || existErrorRewardRate || existErrorPendingReward;

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
        return {} as URI;
      }
      //need to remove the data:application/json;base64, to decode the base64
      const nftUri = Buffer.from(uri.replace('data:application/json;base64,', ''), 'base64').toString();
      return JSON.parse(nftUri) as URI;
    });
    return formatPosition(
      _nftsURIs,
      nftsIndexes,
      positionsAmountState,
      positionsRewardRateState,
      positionsPedingRewardsState,
    );
  }, [account, positionsAmountState, positionsRewardRateState, nftsURIs, nftsIndexes, isLoadingIndexes]);
}
