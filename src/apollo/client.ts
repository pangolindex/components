import { CHAINS, ChainId } from '@pangolindex/sdk';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { GraphQLClient } from 'graphql-request';
import { SUBGRAPH_BASE_URL } from 'src/constants';
import { useChainId } from 'src/hooks';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: `${SUBGRAPH_BASE_URL}/exchange`,
  }),
  cache: new InMemoryCache(),
  // shouldBatch: true,
});

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/dasconnor/avalanche-blocks',
  }),
  cache: new InMemoryCache(),
});

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
