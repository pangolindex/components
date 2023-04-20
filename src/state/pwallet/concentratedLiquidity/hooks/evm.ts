import {
  CAVAX,
  CHAINS,
  ConcentratedPool,
  JSBI,
  NonfungiblePositionManager,
  Percent,
  Position,
  TokenAmount,
} from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { BIPS_BASE } from 'src/constants/swap';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { usePool } from 'src/hooks/concentratedLiquidity/hooks/common';
import { useTokensHook } from 'src/hooks/tokens';
import { useConcLiqNFTPositionManagerContract } from 'src/hooks/useContract';
import { useCurrency } from 'src/hooks/useCurrency';
import { Field } from 'src/state/pmint/concentratedLiquidity/atom';
import { useSingleCallResult, useSingleContractMultipleData } from 'src/state/pmulticall/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { calculateGasMargin, waitForTransaction } from 'src/utils';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import {
  ConcAddLiquidityProps,
  ConcentratedLiquidityCollectFeesProps,
  PositionDetails,
  UseConcentratedPositionResults,
  UseConcentratedPositionsResults,
} from '../types';
import { useConcentratedPositionsFromTokenIdsHook } from './index';

// It returns the positions based on the tokenIds.
export function useConcentratedPositionsFromTokenIds(
  tokenIds: BigNumber[] | undefined,
): UseConcentratedPositionsResults {
  const positionManager = useConcLiqNFTPositionManagerContract();
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds]);
  const results = useSingleContractMultipleData(positionManager, 'positions', inputs);

  const loading = useMemo(() => results.some(({ loading }) => loading), [results]);
  const error = useMemo(() => results.some(({ error }) => error), [results]);

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i];
        const result = call.result as any; // any => CallStateResult
        return {
          tokenId,
          fee: result.fee,
          feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
          liquidity: result.liquidity,
          nonce: result.nonce,
          operator: result.operator,
          tickLower: result.tickLower,
          tickUpper: result.tickUpper,
          token0: result.token0,
          token1: result.token1,
          tokensOwed0: result.tokensOwed0,
          tokensOwed1: result.tokensOwed1,
        };
      });
    }
    return undefined;
  }, [loading, error, results, tokenIds]);

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
  };
}

export function useConcentratedPositionFromTokenId(tokenId: BigNumber | undefined): UseConcentratedPositionResults {
  const chainId = useChainId();

  const useConcentratedPositionsFromTokenIds = useConcentratedPositionsFromTokenIdsHook[chainId];

  const position = useConcentratedPositionsFromTokenIds(tokenId ? [tokenId] : undefined);
  return {
    loading: position.loading,
    position: position.positions?.[0],
  };
}

// It return the positions of the user.
export function useGetUserPositions() {
  const { account } = usePangolinWeb3();
  const positionManager = useConcLiqNFTPositionManagerContract();

  const chainId = useChainId();
  const useTokens = useTokensHook[chainId];

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    account ?? undefined,
  ]);

  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber();

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = [] as any;
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i]);
      }
      return tokenRequests;
    }
    return [];
  }, [account, accountBalance]);

  const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs);
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults]);

  // If you're trying to access data related to user's liquidity positions,
  // you need the tokenIds for those positions
  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is any => !!result)
        .map((result) => BigNumber.from(result[0]));
    }
    return [];
  }, [account, tokenIdResults]);

  const { positions, loading: positionsLoading } = useConcentratedPositionsFromTokenIds(tokenIds);

  const uniqueTokens = useMemo(() => {
    if (positions) {
      const tokens = positions.map((position) => {
        return [position.token0, position.token1];
      });

      const uniqueTokens = [...new Set(tokens.flat())];
      return uniqueTokens;
    }
    return [];
  }, [positions]);

  const uniqueTokensWithData = useTokens(uniqueTokens);

  const positionsWithTokens = useMemo(() => {
    if (positions) {
      const positionsWithTokenDetails = positions.map((position) => {
        const token0 = uniqueTokensWithData?.find((token) => token?.address === position.token0);
        const token1 = uniqueTokensWithData?.find((token) => token?.address === position.token1);
        return {
          ...position,
          token0,
          token1,
        };
      });
      return positionsWithTokenDetails;
    }
  }, [positions, uniqueTokensWithData]);

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions: positionsWithTokens,
  };
}

export function useDerivedPositionInfo(positionDetails: PositionDetails | undefined): {
  position: Position | undefined;
  pool: ConcentratedPool | undefined;
} {
  const currency0 = useCurrency(positionDetails?.token0?.address);
  const currency1 = useCurrency(positionDetails?.token1?.address);

  // construct pool data
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, positionDetails?.fee);

  let position: any = undefined;
  if (pool && positionDetails) {
    position = new Position({
      pool,
      liquidity: positionDetails?.liquidity.toString(),
      tickLower: positionDetails?.tickLower || 0, // TODO
      tickUpper: positionDetails?.tickUpper || 0, // TODO
    });
  }

  return {
    position,
    pool: pool ?? undefined,
  };
}

export function useConcentratedAddLiquidity() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();

  return async (data: ConcAddLiquidityProps) => {
    if (!chainId || !library || !account) return;

    const {
      parsedAmounts,
      deadline,
      noLiquidity,
      allowedSlippage,
      currencies,
      position,
      hasExistingPosition,
      tokenId,
    } = data;

    const { CURRENCY_A: currencyA, CURRENCY_B: currencyB } = currencies;

    try {
      if (position && account && deadline) {
        const useNative =
          currencyA === CAVAX[chainId] ? currencyA : currencyB === CAVAX[chainId] ? currencyB : undefined;

        const { calldata, value } =
          hasExistingPosition && tokenId
            ? NonfungiblePositionManager.addCallParameters(position, {
                tokenId: tokenId?.toString(),
                slippageTolerance: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                deadline: deadline.toString(),
                useNative: wrappedCurrency(useNative, chainId),
              })
            : NonfungiblePositionManager.addCallParameters(position, {
                slippageTolerance: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                recipient: account,
                deadline: deadline.toString(),
                useNative: wrappedCurrency(useNative, chainId),
                createPool: noLiquidity,
              });

        const txn: { to: string; data: string; value: string } = {
          to: CHAINS[chainId]?.contracts?.concentratedLiquidity?.nftManager ?? '',
          data: calldata,
          value,
        };

        const estimatedGasLimit = await library.getSigner().estimateGas(txn);

        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimatedGasLimit),
        };

        const response = await library.getSigner().sendTransaction(newTxn);

        await waitForTransaction(response, 5);

        addTransaction(response, {
          summary:
            'Added ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            currencies[Field.CURRENCY_A]?.symbol +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            currencies[Field.CURRENCY_B]?.symbol,
        });

        return response;
      }
    } catch (err) {
      const _err = err as any;
      // we only care if the error is something _other_ than the user rejected the tx
      if (_err?.code !== 4001) {
        console.error(_err);
      }
    } finally {
      // This is intentional
    }
  };
}

export function useConcentratedCollectEarnedFees() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();

  return async (data: ConcentratedLiquidityCollectFeesProps) => {
    const { tokenId, tokens, feeValues } = data;
    const { token0, token1 } = tokens;
    const { feeValue0, feeValue1 } = feeValues;
    if (!token0 || !token1 || !chainId || !account || !tokenId) return;

    try {
      const param = {
        tokenId: tokenId.toString(),
        expectedCurrencyOwed0: feeValue0 ?? TokenAmount.fromRawAmount(token0, 0),
        expectedCurrencyOwed1: feeValue1 ?? TokenAmount.fromRawAmount(token1, 0),
        recipient: account,
        chainId: chainId,
      };
      // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
      // vast majority of cases
      const { calldata, value } = NonfungiblePositionManager.collectCallParameters(param);

      const txn: { to: string; data: string; value: string } = {
        to: CHAINS[chainId]?.contracts?.concentratedLiquidity?.nftManager ?? '',
        data: calldata,
        value,
      };

      const estimatedGasLimit = await library.getSigner().estimateGas(txn);

      const newTxn = {
        ...txn,
        gasLimit: calculateGasMargin(estimatedGasLimit),
      };

      const response = await library.getSigner().sendTransaction(newTxn);

      await waitForTransaction(response, 5);

      addTransaction(response, {
        summary:
          'Collect' +
          ' ' +
          token0?.symbol +
          'AND' +
          ' ' +
          token1?.symbol +
          ' ' +
          'Fees' +
          ' ' +
          param?.expectedCurrencyOwed0?.toExact() +
          'AND' +
          ' ' +
          param?.expectedCurrencyOwed1?.toExact(),
      });

      return response;
    } catch (err) {
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
      }
    }
  };
}
