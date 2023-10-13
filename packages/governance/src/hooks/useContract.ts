import { PNG, useChainId, useContract } from '@honeycomb-finance/shared';
import { CHAINS } from '@pangolindex/sdk';
import { GovernorAlphaABI, GovernorPangoABI, GovernorPangoHederaABI, PNGABI } from 'src/constants';

export function usePngContract() {
  const chainId = useChainId();
  return useContract(PNG[chainId].address, PNGABI, true);
}

export function useGovernorAlphaContract() {
  const chainId = useChainId();
  const address = chainId ? CHAINS[chainId]?.contracts?.governor?.address : undefined;

  return useContract(address, GovernorAlphaABI, true);
}

export function useGovernorPangoContract() {
  const chainId = useChainId();
  const address = chainId ? CHAINS[chainId]?.contracts?.governor?.address : undefined;

  return useContract(address, GovernorPangoABI, true);
}

export function useGovernorPangoContractHedera() {
  const chainId = useChainId();
  const address = chainId ? CHAINS[chainId]?.contracts?.governor?.address : undefined;

  return useContract(address, GovernorPangoHederaABI, true);
}
