import { MINICHEF_ADDRESS, useChainId, useContract } from '@pangolindex/shared';
import MiniChefV2 from '@pangolindex/exchange-contracts/artifacts/contracts/mini-chef/MiniChefV2.sol/MiniChefV2.json';

export function useMiniChefContract() {
  const chainId = useChainId();
  return useContract(MINICHEF_ADDRESS[chainId], MiniChefV2.abi, true);
}
