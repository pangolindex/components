import { ConcentratedPool, Position } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { usePool } from 'src/hooks/concentratedLiquidity/hooks/common';
import { useV3NFTPositionManagerContract } from 'src/hooks/useContract';
import { useCurrency } from 'src/hooks/useCurrency';
import { useSingleCallResult, useSingleContractMultipleData } from 'src/state/pmulticall/hooks';
import { PositionDetails, UseConcentratedPositionResults, UseConcentratedPositionsResults } from '../types';
import { useConcentratedPositionsFromTokenIdsHook } from './index';

// It returns the positions based on the tokenIds.
export function useConcentratedPositionsFromTokenIds(
  tokenIds: BigNumber[] | undefined,
): UseConcentratedPositionsResults {
  const positionManager = useV3NFTPositionManagerContract();
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
  const positionManager = useV3NFTPositionManagerContract();

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    account ?? undefined,
  ]);

  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber();

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = [] as any; // as any TODO:
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
        .filter((result): result is any => !!result) // any => CallStateResult
        .map((result) => BigNumber.from(result[0]));
    }
    return [];
  }, [account, tokenIdResults]);

  const { positions, loading: positionsLoading } = useConcentratedPositionsFromTokenIds(tokenIds);

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions,
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
