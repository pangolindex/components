import { CHAINS, ChainId } from '@pangolindex/sdk';
import { GraphQLClient } from 'graphql-request';
import { useChainId } from 'src/provider';

export enum SubgraphEnum {
  Exchange = 'exchange',
  Pangochef = 'pangochef',
  Minichef = 'minichef',
  Elixir = 'elixir',
  SingleStaking = 'singleStaking',
  Governance = 'governance',
  Blocks = 'blocks',
}

export const getSubgraphClient = (chainId: ChainId, subgraph: SubgraphEnum) => {
  const url = CHAINS[chainId]?.subgraph?.[subgraph];

  // this is just for testing, not meant for production usage
  // if (chainId === ChainId.FUJI) {
  //   url = 'http://localhost:8000/subgraphs/name/fuji/pangolin-v3';
  // }

  if (url) {
    return new GraphQLClient(url);
  }
};

export function useSubgraphClient(subgraph: SubgraphEnum): GraphQLClient | undefined {
  const chainId = useChainId();
  return getSubgraphClient(chainId, subgraph);
}
