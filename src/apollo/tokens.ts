import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useChainId } from 'src/hooks';
import { validateAddressMapping } from 'src/utils';
import { SubgraphEnum, useSubgraphClient } from './client';

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
  // always send lowercase ids to subgraph as
  // subgraph has only lowercase ids
  const tokensToFind = useMemo(
    () => (tokenAddresses || []).filter((item) => !!item).map((address) => address?.toLowerCase()) as string[],
    [tokenAddresses],
  );
  const chainId = useChainId();
  const validateAddress = validateAddressMapping[chainId];
  const gqlClient = useSubgraphClient(SubgraphEnum.Exchange);
  // get tokens from subgraph
  return useQuery<SubgraphToken[]>(
    ['get-subgraph-tokens', chainId, ...tokensToFind],
    async () => {
      if (!gqlClient) return [];
      const data = await gqlClient.request<{ tokens: SubgraphToken[] }>(GET_TOKENS, { tokenAddresses: tokensToFind });
      // convert addresses to checksum address
      return (
        data?.tokens
          ?.map((item) => ({ ...item, id: validateAddress(item.id) } as SubgraphToken))
          // only keep tokens that has id as string
          // because validateAddress returns string if valid address
          // and return false if invalid address, so we want to remove those invalid address tokens
          ?.filter((item) => typeof item.id === 'string')
      );
    },
    { enabled: !!gqlClient },
  );
};
