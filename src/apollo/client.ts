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

export const getPangochefSubgraphClient = (chainId: ChainId) => {
  const url = CHAINS[chainId]?.subgraph?.pangochef;

  if (url) {
    return new GraphQLClient(url);
  }
};

export function usePangochefSubgraphClient(): GraphQLClient | undefined {
  const chainId = useChainId();
  return getPangochefSubgraphClient(chainId);
}

export const getMinichefSubgraphClient = (chainId: ChainId) => {
  const url = CHAINS[chainId]?.subgraph?.minichef;

  if (url) {
    return new GraphQLClient(url);
  }
};

export function useMinichefSubgraphClient(): GraphQLClient | undefined {
  const chainId = useChainId();
  return getMinichefSubgraphClient(chainId);
}

export const getExchangeSubgraphClient = (chainId: ChainId) => {
  const url = CHAINS[chainId]?.subgraph?.exchange;

  if (url) {
    return new GraphQLClient(url);
  }
};

export function useExchangeSubgraphClient(): GraphQLClient | undefined {
  const chainId = useChainId();
  return getExchangeSubgraphClient(chainId);
}
