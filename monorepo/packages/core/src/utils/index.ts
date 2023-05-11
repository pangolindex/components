import { ALL_CHAINS, Chain, ChainId } from '@pangolindex/sdk';

export function getChainByNumber(chainId: ChainId | number): Chain | undefined {
  return ALL_CHAINS.find((chain) => chain.chain_id === chainId);
}
