/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { JSBI, TokenAmount } from '@pangolindex/sdk';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useHederaTokenAssociated } from 'src/hooks/Tokens';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useUSDCPriceHook } from 'src/hooks/multiChainsHooks';
import { useHederaApproveCallback } from 'src/hooks/useApproveCallback';
import { useSarNFTStakingContract, useSarStakingContract } from 'src/hooks/useContract';
import { existSarContract } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import { useSingleContractMultipleData } from '../pmulticall/hooks';
import { useDerivedStakeInfo } from '../pstake/hooks';
import { useTransactionAdder } from '../ptransactions/hooks';
import { useTokenBalance } from '../pwallet/hooks';
import { Position, URI } from './types';

/**
 *
 * @param positionId Id of a Position
 * @returns Return some utils functions for stake more or create a new Position
 */
export function useDerivativeHederaSarStake(positionId?: BigNumber) {
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(4);
  const [stakeError, setStakeError] = useState<string | null>(null);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const sarNftContract = useSarNFTStakingContract();

  const addTransaction = useTransactionAdder();
  const { t } = useTranslation();

  const png = PNG[chainId];

  const userPngBalance = useTokenBalance(account ?? ZERO_ADDRESS, png);

  // used for max input button
  const maxAmountInput = maxAmountSpend(chainId, userPngBalance);

  const useUSDCPrice = useUSDCPriceHook[chainId];
  const usdcPrice = useUSDCPrice(png);
  const dollerWorth =
    userPngBalance?.greaterThan('0') && usdcPrice ? Number(typedValue) * Number(usdcPrice.toFixed()) : undefined;

  const wrappedOnDismiss = useCallback(() => {
    setStakeError(null);
    setTypedValue('');
    setStepIndex(0);
    setHash(null);
    setAttempting(false);
  }, []);

  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, png, userPngBalance);
  const [approval, approveCallback] = useHederaApproveCallback(chainId, parsedAmount, sarStakingContract?.address);

  const mixpanel = useMixpanel();

  const onUserInput = useCallback((_typedValue: string) => {
    setTypedValue(_typedValue);
  }, []);

  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
    setStepIndex(4);
  }, [maxAmountInput, onUserInput]);

  const onChangePercentage = (value: number) => {
    if (!userPngBalance) {
      setTypedValue('0');
      return;
    }
    if (value === 100) {
      setTypedValue((userPngBalance as TokenAmount).toExact());
    } else if (value === 0) {
      setTypedValue('0');
    } else {
      const newAmount = (userPngBalance as TokenAmount)
        .multiply(JSBI.BigInt(value))
        .divide(JSBI.BigInt(100)) as TokenAmount;

      setTypedValue(newAmount.toSignificant(6));
    }
  };

  const {
    associate: associate,
    hederaAssociated: isAssociated,
    isLoading: isLoading,
  } = useHederaTokenAssociated(sarNftContract?.address, 'Pangolin Sar NFT');

  const onStake = async () => {
    if (!sarStakingContract || !parsedAmount || !account || isLoading) {
      return;
    }
    setAttempting(true);
    try {
      let response: { hash: string } | null;

      if (!isAssociated && !!associate) {
        await associate();
      }

      // double check
      if (!isAssociated) return;

      if (!positionId) {
        response = await hederaFn.sarStake({
          methodName: 'mint',
          amount: parsedAmount.raw.toString(),
          chainId: chainId,
          account: account,
        });
      } else {
        response = await hederaFn.sarStake({
          methodName: 'stake',
          amount: parsedAmount.raw.toString(),
          chainId: chainId,
          account: account,
          positionId: positionId.toString(),
        });
      }

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
      associate,
      approveCallback,
      onUserInput,
      handleMax,
    ],
  );
}

// Returns a list of user positions
export function useHederaSarPositions() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const sarNFTcontract = useSarNFTStakingContract();

  const { data, isLoading: isLoadingIndexes } = useQuery(
    ['hedera-nft-index', account, sarNFTcontract?.address],
    async () => {
      const nfts = await hederaFn.getNftInfo(sarNFTcontract?.address ?? '', account ?? '');
      const _nftsIndexes: (string | undefined)[][] = [];
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
    const positions: Position[] = _nftsURIs.map((uri, index) => {
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
  }, [account, positionsAmountState, positionsRewardRateState, nftsURIs, nftsIndexes, isLoadingIndexes]);
}
