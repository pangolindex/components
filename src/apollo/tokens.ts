import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useQuery } from 'react-query';
import { useChainId } from 'src/hooks';
import { subgraphClient } from './client';

export type SubgraphToken = {
  id: string;
  name: string;
  symbol: string;
  derivedUSD: string;
  decimals: string;
  derivedETH: string;
};

export const GET_TOKENS = gql`
  query tokens($tokenAddresses: [String]) {
    tokens(where: { id_in: $tokenAddresses }) {
      id
      name
      symbol
      derivedUSD
      decimals
      derivedETH
    }
  }
`;

/**
 * this hook is useful to find information of given token addresses from subgraph
 * @param tokenAddresses array of token address
 * @returns list of tokens
 */
export const useSubgraphTokens = (tokenAddresses: (string | undefined)[]) => {
  const tokensToFind = tokenAddresses.filter((item) => !!item) as string[];
  const chainId = useChainId();
  // get tokens from subgraph
  return useQuery<SubgraphToken[]>(['get-subgraph-tokens', chainId, ...tokensToFind], async () => {
    const gqlClient = subgraphClient[chainId];
    if (!gqlClient) {
      return null;
    }
    const data = await gqlClient.request(GET_TOKENS, { tokenAddresses: tokensToFind });

    return data?.tokens;
  });
};
