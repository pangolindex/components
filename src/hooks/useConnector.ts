import { ChainId } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { mainnetHederaFn, testnetHederaFn } from 'src/utils/hedera';
import { useChainId } from '.';

export function useHederaFn() {
  const chainId = useChainId();

  return useMemo(() => {
    if (chainId === ChainId.HEDERA_TESTNET) {
      return testnetHederaFn;
    }

    return mainnetHederaFn;
  }, [chainId]);
}
