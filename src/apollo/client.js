import { ChainId } from '@pangolindex/sdk';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { GraphQLClient } from 'graphql-request';
import { SUBGRAPH_BASE_URL } from 'src/constants';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: `${SUBGRAPH_BASE_URL}/exchange`,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/dasconnor/avalanche-blocks',
  }),
  cache: new InMemoryCache(),
});

export const avalancheMininchefV2Client = new GraphQLClient(
  'https://api.thegraph.com/subgraphs/name/sarjuhansaliya/minichefv2-dummy',
  { headers: {} },
);

export const mininchefV2Clients = {
  [ChainId.AVALANCHE]: avalancheMininchefV2Client,
  [ChainId.FUJI]: undefined,
  [ChainId.WAGMI]: undefined,
  [ChainId.COSTON]: undefined,
  [ChainId.SONGBIRD]: undefined,
  [ChainId.HEDERA_TESTNET]: undefined,
  [ChainId.NEAR_MAINNET]: undefined,
  [ChainId.NEAR_TESTNET]: undefined,
  [ChainId.ETHEREUM]: undefined,
  [ChainId.POLYGON]: undefined,
  [ChainId.FANTOM]: undefined,
  [ChainId.XDAI]: undefined,
  [ChainId.BSC]: undefined,
  [ChainId.ARBITRUM]: undefined,
  [ChainId.CELO]: undefined,
  [ChainId.OKXCHAIN]: undefined,
  [ChainId.VELAS]: undefined,
  [ChainId.AURORA]: undefined,
  [ChainId.CRONOS]: undefined,
  [ChainId.FUSE]: undefined,
  [ChainId.MOONRIVER]: undefined,
  [ChainId.MOONBEAM]: undefined,
  [ChainId.OP]: undefined,
};
