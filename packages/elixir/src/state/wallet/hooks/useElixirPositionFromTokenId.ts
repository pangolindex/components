import { useChainId } from '@honeycomb-finance/shared';
import { BigNumber } from 'ethers';
import { UseElixirPositionResults } from '../types';
import { useElixirPositionsFromTokenIdsHook } from './index';

export function useElixirPositionFromTokenId(tokenId: BigNumber | undefined): UseElixirPositionResults {
  const chainId = useChainId();

  const useElixirPositionsFromTokenIds = useElixirPositionsFromTokenIdsHook[chainId];

  const position = useElixirPositionsFromTokenIds(tokenId ? [tokenId] : undefined);
  return {
    loading: position.loading,
    position: position.positions?.[0],
  };
}
