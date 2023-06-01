import { CHAINS, ChainId } from '@pangolindex/sdk';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { GraphQLClient } from 'graphql-request';
import { useChainId } from 'src/hooks';

export const getExchangeSubgraphApolloClient = (chainId: ChainId) => {
  const url = CHAINS[chainId]?.subgraph?.exchange;

  if (url) {
    return new ApolloClient({
      link: new HttpLink({
        uri: url,
      }),
      cache: new InMemoryCache(),
    });
  }
};

export const getBlockSubgraphApolloClient = (chainId: ChainId) => {
  const url = CHAINS[chainId]?.subgraph?.blocks;

  if (url) {
    return new ApolloClient({
      link: new HttpLink({
        uri: url,
      }),
      cache: new InMemoryCache(),
    });
  }
};

export const getGovernanceSubgraphApolloClient = (chainId: ChainId) => {
  console.log('chainId', chainId);
  //const url = CHAINS[chainId]?.subgraph?.governance;
  const url = 'https://4631-122-182-179-131.ngrok-free.app/subgraphs/name/governor';

  if (url) {
    return new ApolloClient({
      link: new HttpLink({
        uri: url,
      }),
      cache: new InMemoryCache(),
    });
  }
};

export enum SubgraphEnum {
  Exchange = 'exchange',
  Pangochef = 'pangochef',
  Minichef = 'minichef',
  Elixir = 'elixir',
  SingleStaking = 'singleStaking',
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
