import { Contract } from '@ethersproject/contracts';
import { WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { ERC20_ABI, MULTICALL_ABI, WETH_ABI } from 'src/abis';
import { MULTICALL_NETWORKS, ZERO_ADDRESS } from 'src/constants';
import { useLibrary, usePangolinWeb3 } from 'src/provider';
import { getContract } from 'src/utils';

// returns null on errors
export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { account } = usePangolinWeb3();
  const { library } = useLibrary();

  return useMemo(() => {
    if (!address || address === ZERO_ADDRESS || !ABI || !library) return null;
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined);
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = usePangolinWeb3();
  return useContract(chainId ? WAVAX[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible);
}

export function useMulticallContract(): Contract | null {
  const { chainId } = usePangolinWeb3();
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false);
}
