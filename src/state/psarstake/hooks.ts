import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { JSBI, TokenAmount } from '@pangolindex/sdk';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useApproveCallback } from 'src/hooks/useApproveCallback';
import { useSarStakingContract } from 'src/hooks/useContract';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import useUSDCPrice from 'src/utils/useUSDCPrice';
import { useSingleCallResult, useSingleContractMultipleData } from '../pmulticall/hooks';
import { useDerivedStakeInfo } from '../pstake/hooks';
import { useTransactionAdder } from '../ptransactions/hooks';
import { useTokenBalances } from '../pwallet/hooks';

export function useSarStakeInfo() {
  const chainId = useChainId();
  const sarStakingContract = useSarStakingContract();
  const png = PNG[chainId];

  const rewardRate: BigNumber | undefined = useSingleCallResult(sarStakingContract, 'rewardRate').result?.[0];
  const totalValueVariables = useSingleCallResult(sarStakingContract, 'totalValueVariables')?.result;

  return useMemo(() => {
    const APR =
      rewardRate && totalValueVariables && totalValueVariables?.balance
        ? rewardRate.mul(86400).mul(365).mul(100).div(totalValueVariables.balance)
        : null;
    const totalStaked = new TokenAmount(png, totalValueVariables ? totalValueVariables?.balance.toString() : '0');

    return { APR, totalStaked };
  }, [rewardRate, totalValueVariables]);
}

export function useDerivativeSarStake(positionId?: BigNumber) {
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(4);
  const [stakeError, setStakeError] = useState<string | null>(null);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const addTransaction = useTransactionAdder();
  const { t } = useTranslation();

  const png = PNG[chainId];

  const tokensBalances = useTokenBalances(account ?? '', [png]);
  const userPngBalance = tokensBalances[png.address];

  // used for max input button
  const maxAmountInput = maxAmountSpend(chainId, userPngBalance);

  const usdcPrice = useUSDCPrice(png);
  const dollerWorth =
    userPngBalance?.greaterThan('0') && usdcPrice ? Number(typedValue) * Number(usdcPrice.toFixed()) : undefined;

  const wrappedOnDismiss = useCallback(() => {
    setStakeError(null);
    setTypedValue('0');
    setStepIndex(0);
    setHash(null);
    setAttempting(false);
  }, []);

  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, png, userPngBalance);
  const [approval, approveCallback] = useApproveCallback(chainId, parsedAmount, sarStakingContract?.address);

  // wrapped onUserInput to clear signatures
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

  const onStake = async () => {
    if (!sarStakingContract || !parsedAmount) {
      return;
    }
    setAttempting(true);
    try {
      let response: TransactionResponse;
      if (!positionId) {
        // create a new position
        response = await sarStakingContract.mint(`0x${parsedAmount.raw.toString(16)}`);
        await response.wait(1);
      } else {
        // adding more png to an existing position
        response = await sarStakingContract.stake(positionId.toHexString(), `0x${parsedAmount.raw.toString(16)}`);
        await response.wait(1);
      }
      addTransaction(response, {
        summary: t('earnPage.stakeStakingTokens', { symbol: 'PNG' }),
      });
      setHash(response.hash);
    } catch (error) {
      // we only care if the error is something _other_ than the user rejected the tx
      const err = error as any;
      if (err?.code !== 4001) {
        console.error(err);
        setStakeError(err?.message);
      }
    } finally {
      setAttempting(false);
    }
  };

  return useMemo(
    () => ({
      attempting,
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
      parsedAmount,
      hash,
      stepIndex,
      dollerWorth,
      error,
      approval,
      account,
      approveCallback,
      onUserInput,
      handleMax,
    ],
  );
}

export interface URI {
  name: string;
  description: string;
  external_url: string;
  attributes: any[];
  image: string;
}

export interface Position {
  id: BigNumber;
  amount: BigNumber;
  apr: BigNumber;
  uri: URI;
}
export function useSarPositions() {
  const ZERO = BigNumber.from(0);
  const { account } = usePangolinWeb3();

  const sarStakingContract = useSarStakingContract();

  // get total balance of all positions
  const balanceState = useSingleCallResult(sarStakingContract, 'balanceOf', [account ?? ZERO_ADDRESS]);
  const balance: BigNumber | undefined = balanceState?.result?.[0];

  // get all positions ids
  const nftsState = useSingleCallResult(sarStakingContract, 'tokensOfOwnerByIndex', [
    account ?? ZERO_ADDRESS,
    ZERO.toHexString(),
    balance?.sub(1).toHexString() ?? ZERO.toHexString(),
  ]);
  const nftsIndexes: string[][] = nftsState.result?.[0]?.map((index: BigNumber) => {
    return [index.toHexString()];
  }); // [ [ "0x01" ], [ "0x02" ], ... ]

  // get the staked amount for each position
  const positionsAmountState = useSingleContractMultipleData(sarStakingContract, 'positions', nftsIndexes);
  // get the reward rate for each position
  const positionsRewardRateState = useSingleContractMultipleData(sarStakingContract, 'positionRewardRate', nftsIndexes);

  //get all NFTs URIs from the positions
  const nftsURIsState = useSingleContractMultipleData(sarStakingContract, 'tokenURI', nftsIndexes ?? []);

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

    const isLoading =
      balanceState.loading || nftsState.loading || !isAllFetchedURI || !isAllFetchedAmount || !isAllFetchedRewardRate;
    // first moments loading is false and valid is false then is loading the query is true
    const isValid = balanceState.valid && nftsState.valid && isValidURIs && isValidAmounts && isValidRewardRates;

    const error = balanceState.error || nftsState.error || existErrorURI || existErrorAmount || existErrorRewardRate;

    // if is loading or exist error or not exist account return empty array
    if (isLoading || !isValid) {
      return { positions: [] as Position[], isLoading: true };
    }
    if (error || !account) {
      return { positions: [] as Position[], isLoading: false };
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
      const amount = positionsAmountState[index].result?.[0];
      const rewardRate = positionsRewardRateState[index].result?.[0];
      const id = nftsIndexes[index][0];
      const apr = rewardRate?.mul(86400).mul(365).mul(100).div(amount?.balance);

      if (!amount || !rewardRate || !uri) {
        return {} as Position;
      }

      return {
        id: BigNumber.from(id),
        amount: amount?.balance,
        apr: apr,
        uri: uri,
      };
    });
    // remove the empty positions
    return { positions: positions.filter((position) => !!position), isLoading: false };
  }, [account, balanceState, positionsAmountState, positionsRewardRateState, nftsState, nftsURIsState]);
}
