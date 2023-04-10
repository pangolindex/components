import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { usePangolinWeb3 } from 'src/hooks';
import { useTokens } from 'src/hooks/tokens/evm';
import { useV3NFTPositionManagerContract } from 'src/hooks/useContract';
import { useSingleCallResult, useSingleContractMultipleData } from 'src/state/pmulticall/hooks';
import { UseV3PositionsResults } from '../types';

// It returns the positions based on the tokenIds.
function useV3PositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
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

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(tokenIds);

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
