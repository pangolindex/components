import { Contract } from '@ethersproject/contracts';
import { CHAINS } from '@pangolindex/sdk';
import NonFungiblePositionManager from 'src/constants/abis/nonfungiblePositionManager.json';
import TickLensABI from 'src/constants/abis/tickLens.json';
import { useChainId, useContract } from '@pangolindex/shared';

export function useConcLiqNFTPositionManagerContract(withSignerIfPossible?: boolean): Contract | null {
  const chainId = useChainId();
  return useContract(
    chainId && CHAINS[chainId]?.contracts?.elixir?.nftManager,
    NonFungiblePositionManager.abi,
    withSignerIfPossible,
  );
}

export function useTickLensContract(): Contract | null {
  const chainId = useChainId();
  const address = chainId ? CHAINS[chainId]?.contracts?.elixir?.tickLens : undefined;
  return useContract(address, TickLensABI.abi);
}
