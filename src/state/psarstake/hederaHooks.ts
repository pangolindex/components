/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { useEffect, useMemo, useState } from 'react';
import { BIGNUMBER_ZERO } from 'src/constants';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useSarNFTStakingContract, useSarStakingContract } from 'src/hooks/useContract';
import { existSarContract } from 'src/utils';
import { useSingleContractMultipleData } from '../pmulticall/hooks';
import { Position, URI } from './types';

// Returns a list of user positions
export function useHederaSarPositions() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const sarNFTcontract = useSarNFTStakingContract();

  const [nftsIndexes, setNftsIndexes] = useState<string[][] | undefined>();

  useEffect(() => {
    const getNftsIndexes = async () => {
      if (!sarStakingContract || !sarNFTcontract) return;

      const balance: BigNumber = await sarNFTcontract.balanceOf(account);

      if (balance.isZero()) {
        setNftsIndexes([] as string[][]);
        return;
      }

      // get all positions ids
      const indexes: BigNumber[] = await sarStakingContract.tokensOfOwnerByIndex(
        account,
        BIGNUMBER_ZERO.toHexString(),
        balance.sub(1).toHexString(),
      );

      const _nftsIndexes = indexes?.map((index) => {
        return [index.toHexString()];
      });

      setNftsIndexes(_nftsIndexes);
    };

    getNftsIndexes();
  }, [sarStakingContract, sarNFTcontract]);

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

  //get all NFTs URIs from the positions
  const nftsURIsState = useSingleContractMultipleData(sarNFTcontract, 'tokenURI', nftsIndexes ?? []);

  return useMemo(() => {
    const isAllFetchedURI = nftsURIsState.every((result) => !result.loading);
    const existErrorURI = nftsURIsState.some((result) => result.error);
    const isValidURIs = nftsURIsState.every((result) => result.valid);

    const isAllFetchedAmount = positionsAmountState.every((result) => !result.loading);
    const existErrorAmount = positionsAmountState.some((result) => result.error);
    const isValidAmounts = positionsAmountState.every((result) => result.valid);

    const isAllFetchedRewardRate = positionsRewardRateState.every((result) => !result.loading);
    const existErrorRewardRate = positionsRewardRateState.some((result) => result.error);
    const isValidRewardRates = positionsRewardRateState.every((result) => result.valid);

    const isAllFetchedPendingReward = positionsPedingRewardsState.every((result) => !result.loading);
    const existErrorPendingReward = positionsPedingRewardsState.some((result) => result.error);
    const isValidPendingRewards = positionsPedingRewardsState.every((result) => result.valid);

    const isLoading = !isAllFetchedURI || !isAllFetchedAmount || !isAllFetchedRewardRate || !isAllFetchedPendingReward;
    // first moments loading is false and valid is false then is loading the query is true
    const isValid = isValidURIs && isValidAmounts && isValidRewardRates && isValidPendingRewards;

    const error = existErrorURI || existErrorAmount || existErrorRewardRate || existErrorPendingReward;

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
      return {} as URI;
    });
    const positions: Position[] = nftsURIs.map((uri, index) => {
      const valueVariables: { balance: BigNumber; sumOfEntryTimes: BigNumber } | undefined =
        positionsAmountState[index].result?.valueVariables;
      const rewardRate = positionsRewardRateState[index].result?.[0];
      const pendingRewards = positionsPedingRewardsState[index].result?.[0];
      const id = nftsIndexes[index][0];
      const balance = valueVariables?.balance ?? BigNumber.from(0);
      const apr = rewardRate
        ?.mul(86400)
        .mul(365)
        .mul(100)
        .div(balance.isZero() ? 1 : balance);

      if (!valueVariables || !rewardRate || !pendingRewards || !uri) {
        return {} as Position;
      }

      return {
        id: BigNumber.from(id),
        balance: valueVariables?.balance,
        sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
        apr: apr,
        rewardRate: rewardRate,
        uri: uri,
        pendingRewards: pendingRewards,
      } as Position;
    });
    // remove the empty positions
    return { positions: positions.filter((position) => !!position), isLoading: false };
  }, [account, positionsAmountState, positionsRewardRateState, nftsURIsState, nftsIndexes]);
}
