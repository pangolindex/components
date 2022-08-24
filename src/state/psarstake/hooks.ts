/* eslint-disable max-lines */
import { FunctionFragment } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';
import { JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { useApproveCallback } from 'src/hooks/useApproveCallback';
import { useMulticallContract, useSarStakingContract } from 'src/hooks/useContract';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice';
import { calculateGasMargin, existSarContract, waitForTransaction } from 'src/utils';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import { useSingleCallResult } from '../pmulticall/hooks';
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
  const { library } = useLibrary();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const multiCallContract = useMulticallContract();

  const queryClient = useQueryClient();

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
      await waitForTransaction(library, response, 5);
      addTransaction(response, {
        summary: t('sarStake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
      });
      setHash(response.hash);
      await queryClient.refetchQueries([
        'getSarPortfolio',
        account,
        sarStakingContract?.address,
        multiCallContract?.address,
        chainId,
      ]);
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
  const { library } = useLibrary();
  const chainId = useChainId();

  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const png = PNG[chainId];

  const sarStakingContract = useSarStakingContract();
  const multiCallContract = useMulticallContract();

  const queryClient = useQueryClient();

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
      await waitForTransaction(library, response, 5);
      addTransaction(response, {
        summary: t('sarUnstake.transactionSummary', { symbol: png.symbol, balance: parsedAmount.toSignificant(2) }),
      });
      setHash(response.hash);
      await queryClient.refetchQueries([
        'getSarPortfolio',
        account,
        sarStakingContract?.address,
        multiCallContract?.address,
        chainId,
      ]);
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
  const { library } = useLibrary();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const multiCallContract = useMulticallContract();

  const queryClient = useQueryClient();

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
      await waitForTransaction(library, response, 5);
      addTransaction(response, {
        summary: t('sarCompound.transactionSummary'),
      });
      setHash(response.hash);
      await queryClient.refetchQueries([
        'getSarPortfolio',
        account,
        sarStakingContract?.address,
        multiCallContract?.address,
        chainId,
      ]);
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
  const { library } = useLibrary();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const multiCallContract = useMulticallContract();

  const queryClient = useQueryClient();

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
      await waitForTransaction(library, response, 5);
      addTransaction(response, {
        summary: t('sarClaim.transactionSummary'),
      });
      setHash(response.hash);
      await queryClient.refetchQueries([
        'getSarPortfolio',
        account,
        sarStakingContract?.address,
        multiCallContract?.address,
        chainId,
      ]);
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

/**  Decode the multicall result data
 * @param contract - The contract
 * @param fragment - The function fragment
 * @param data - The data to decode
 */
function decodeMulticallResult(contract: Contract, fragment: FunctionFragment, data: any[]): any {
  return data.map((data) => {
    return contract.interface.decodeFunctionResult(fragment, data);
  });
}

// Returns a list of user positions
export function useSarPositions() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();
  const multiCallContract = useMulticallContract();

  return useQuery(
    ['getSarPortfolio', account, sarStakingContract?.address, multiCallContract?.address, chainId],
    async () => {
      if (!account || !existSarContract(chainId)) {
        return [] as Position[];
      }
      if (!multiCallContract || !sarStakingContract) {
        return undefined;
      }

      // get total balance of all positions
      const balance: BigNumber = await sarStakingContract.balanceOf(account);

      // if balance is 0, return empty list
      if (balance.isZero()) {
        return [] as Position[];
      }

      // get all positions ids
      const nfts: BigNumber[] = await sarStakingContract.tokensOfOwnerByIndex(
        account,
        ZERO.toHexString(),
        balance.sub(1).toHexString(),
      );

      const nftsIndexes = nfts?.map((index) => {
        return [index.toHexString()];
      });

      // get the staked amount for each position via multicall
      const positionsFragment = sarStakingContract.interface.getFunction('positions');
      const positionsAmountCalls = nftsIndexes?.map((index) => {
        return [sarStakingContract.address, sarStakingContract.interface.encodeFunctionData(positionsFragment, index)];
      });

      // get the reward rate for each position via multicall
      const rewardRateFragment = sarStakingContract.interface.getFunction('positionRewardRate');
      const rewardRateCalls = nftsIndexes?.map((index) => {
        return [sarStakingContract.address, sarStakingContract.interface.encodeFunctionData(rewardRateFragment, index)];
      });

      // get peding rewards for each position via multicall
      const pendingRewardsFragment = sarStakingContract.interface.getFunction('positionPendingRewards');
      const pendingRewardsCalls = nftsIndexes?.map((index) => {
        return [
          sarStakingContract.address,
          sarStakingContract.interface.encodeFunctionData(pendingRewardsFragment, index),
        ];
      });

      // get all NFTs URIs from the positions via multicall
      const nftUrisFragment = sarStakingContract.interface.getFunction('tokenURI');
      const nftUrisCalls = nftsIndexes?.map((index) => {
        return [sarStakingContract.address, sarStakingContract.interface.encodeFunctionData(nftUrisFragment, index)];
      });

      const results = await Promise.all([
        multiCallContract.aggregate(positionsAmountCalls),
        multiCallContract.aggregate(rewardRateCalls),
        multiCallContract.aggregate(pendingRewardsCalls),
        multiCallContract.aggregate(nftUrisCalls),
      ]);

      // decode the results
      const positionsAmount = decodeMulticallResult(sarStakingContract, positionsFragment, results?.[0]?.[1]);
      const positionsRewardRate = decodeMulticallResult(sarStakingContract, rewardRateFragment, results?.[1]?.[1]);
      const positionsPendingRewards = decodeMulticallResult(
        sarStakingContract,
        pendingRewardsFragment,
        results?.[2]?.[1],
      );
      const nftsUris = decodeMulticallResult(sarStakingContract, nftUrisFragment, results?.[3]?.[1]);

      if (!positionsAmount || !positionsRewardRate || !positionsPendingRewards || !nftsUris) {
        return [] as Position[];
      }

      // we need to decode the base64 uri to get the real uri
      const nftsURIs = nftsUris.map((value) => {
        if (value) {
          const base64: string = value[0];
          //need to remove the data:application/json;base64, to decode the base64
          const nftUri = Buffer.from(base64.replace('data:application/json;base64,', ''), 'base64').toString();
          return JSON.parse(nftUri) as URI;
        }
        return {} as URI;
      });

      const positions: Position[] = nftsURIs.map((uri, index) => {
        const valueVariables: { balance: BigNumber; sumOfEntryTimes: BigNumber } | undefined =
          positionsAmount[index]?.valueVariables;
        const rewardRate = positionsRewardRate[index][0];
        const pendingRewards = positionsPendingRewards[index][0];
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
      return positions.filter((position) => !!position);
    },
    {
      cacheTime: 60 * 10 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchInterval: 60 * 10 * 1000, // 10 minutes
    },
  );
}
