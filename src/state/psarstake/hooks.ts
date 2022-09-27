/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useApproveCallback } from 'src/hooks/useApproveCallback';
import { useSarStakingContract } from 'src/hooks/useContract';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice';
import { calculateGasMargin, existSarContract, waitForTransaction } from 'src/utils';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import { useSingleCallResult, useSingleContractMultipleData } from '../pmulticall/hooks';
import { useDerivedStakeInfo } from '../pstake/hooks';
import { tryParseAmount } from '../pswap/hooks';
import { useTransactionAdder } from '../ptransactions/hooks';
import { useTokenBalance } from '../pwallet/hooks';

const ZERO = BigNumber.from('0');
export interface URI {
  name: string;
  description: string;
  external_url: string;
  attributes: any[];
  image: string;
}

export interface Position {
  id: BigNumber;
  balance: BigNumber;
  sumOfEntryTimes: BigNumber;
  apr: BigNumber;
  rewardRate: BigNumber;
  pendingRewards: BigNumber;
  uri: URI;
}

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

    const weeklyPNG = !!rewardRate ? rewardRate.mul(86400).mul(7) : ZERO;

    const sumOfEntryTimes: BigNumber = totalValueVariables ? totalValueVariables?.sumOfEntryTimes : ZERO;

    return { apr, totalStaked, sumOfEntryTimes, rewardRate: rewardRate ?? ZERO, weeklyPNG };
  }, [rewardRate, totalValueVariables]);
}

// Return some utils functions for stake more or create a new Position
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

  const userPngBalance = useTokenBalance(account ?? ZERO_ADDRESS, png);

  // used for max input button
  const maxAmountInput = maxAmountSpend(chainId, userPngBalance);

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
  const [approval, approveCallback] = useApproveCallback(chainId, parsedAmount, sarStakingContract?.address);

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
        const estimatedGas = await sarStakingContract.estimateGas.mint(`0x${parsedAmount.raw.toString(16)}`);
        // create a new position
        response = await sarStakingContract.mint(`0x${parsedAmount.raw.toString(16)}`, {
          gasLimit: calculateGasMargin(estimatedGas),
        });
      } else {
        const estimatedGas = await sarStakingContract.estimateGas.mint(`0x${parsedAmount.raw.toString(16)}`);
        // adding more png to an existing position
        response = await sarStakingContract.stake(positionId.toHexString(), `0x${parsedAmount.raw.toString(16)}`, {
          gasLimit: calculateGasMargin(estimatedGas),
        });
      }
      await waitForTransaction(response, 3);
      addTransaction(response, {
        summary: t('sarStake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
      });
      setHash(response.hash);
    } catch (err) {
      // we only care if the error is something _other_ than the user rejected the tx
      const _err = error as any;
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

function useUnstakeParseAmount(typedValue: string, stakingToken: Token, userLiquidityStaked?: TokenAmount) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();

  const parsedInput = tryParseAmount(typedValue, stakingToken, chainId);
  const parsedAmount =
    parsedInput && userLiquidityStaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityStaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = t('stakeHooks.connectWallet');
  }
  if (parsedInput && !parsedAmount) {
    error = error ?? t('stakeHooks.insufficientBalance', { symbol: stakingToken.symbol });
  }
  if (!parsedAmount) {
    error = error ?? t('stakeHooks.enterAmount');
  }

  return {
    parsedAmount,
    error,
  };
}
// Return some utils functions for unstake
export function useDerivativeSarUnstake(position: Position | null) {
  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [unstakeError, setUnstakeError] = useState<string | null>(null);

  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const png = PNG[chainId];

  const sarStakingContract = useSarStakingContract();

  const stakedAmount = new TokenAmount(png, (position?.balance ?? 0).toString());

  const { parsedAmount, error } = useUnstakeParseAmount(typedValue, png, stakedAmount);

  // used for max input button
  const maxAmountInput = maxAmountSpend(chainId, stakedAmount);

  const wrappedOnDismiss = useCallback(() => {
    setUnstakeError(null);
    setTypedValue('');
    setStepIndex(0);
    setHash(null);
    setAttempting(false);
  }, []);

  const onUserInput = useCallback((_typedValue: string) => {
    setTypedValue(_typedValue);
  }, []);

  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
    setStepIndex(4);
  }, [maxAmountInput, onUserInput]);

  const onChangePercentage = (value: number) => {
    if (stakedAmount.lessThan('0')) {
      setTypedValue('0');
      return;
    }
    if (value === 100) {
      setTypedValue(stakedAmount.toExact());
    } else if (value === 0) {
      setTypedValue('0');
    } else {
      const newAmount = stakedAmount.multiply(JSBI.BigInt(value)).divide(JSBI.BigInt(100)) as TokenAmount;

      setTypedValue(newAmount.toSignificant(6));
    }
  };

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
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [compoundError, setCompoundError] = useState<string | null>(null);

  const { account } = usePangolinWeb3();

  const sarStakingContract = useSarStakingContract();

  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const wrappedOnDismiss = useCallback(() => {
    setCompoundError(null);
    setHash(null);
    setAttempting(false);
  }, []);

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
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const { account } = usePangolinWeb3();

  const sarStakingContract = useSarStakingContract();

  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const wrappedOnDismiss = useCallback(() => {
    setClaimError(null);
    setHash(null);
    setAttempting(false);
  }, []);

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

// Returns a list of user positions
export function useSarPositions() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();

  const [nftsIndexes, setNftsIndexes] = useState<string[][] | undefined>();

  useEffect(() => {
    const getNftsIndexes = async () => {
      if (!sarStakingContract) return;

      const balance: BigNumber = await sarStakingContract.balanceOf(account);

      if (balance.isZero()) {
        setNftsIndexes([] as string[][]);
        return;
      }

      // get all positions ids
      const indexes: BigNumber[] = await sarStakingContract.tokensOfOwnerByIndex(
        account,
        ZERO.toHexString(),
        balance.sub(1).toHexString(),
      );

      const _nftsIndexes = indexes?.map((index) => {
        return [index.toHexString()];
      });

      setNftsIndexes(_nftsIndexes);
    };

    getNftsIndexes();
  }, [sarStakingContract]);

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
