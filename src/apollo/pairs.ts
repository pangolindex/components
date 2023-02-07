import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useQuery } from 'react-query';
import { useChainId } from 'src/hooks';
import { subgraphClient } from './client';
import { SubgraphToken } from './tokens';

type SubgraphPair = {
  id: string;
  token0Price: string;
  token1Price: string;
  totalSupply: string;
  trackedReserveETH: string;
  untrackedVolumeUSD: string;
  txCount: string;
  volumeToken0: string;
  volumeToken1: string;
  volumeUSD: string;
  createdAtTimestamp: string;
  createdAtBlockNumber: string;
  reserve0: string;
  reserve1: string;
  reserveETH: string;
  token0: SubgraphToken;
  token1: SubgraphToken;
};

export const GET_PAIRS = gql`
  query pairs($pairAddresses: [String]) {
    pairs(where: { id_in: $pairAddresses }) {
      id
      token0Price
      token1Price
      totalSupply
      trackedReserveETH
      untrackedVolumeUSD
      txCount
      volumeToken0
      volumeToken1
      volumeUSD
      createdAtTimestamp
      createdAtBlockNumber
      reserve0
      reserve1
      reserveETH
      token0 {
        id
        name
        symbol
        derivedUSD
        decimals
      }
      token1 {
        id
        name
        symbol
        derivedUSD
        decimals
      }
    }
  }
`;

/**
 * this hook is useful to find information of given pair addresses from subgraph
 * @param pairAddresses array of pair address
 * @returns list of pairs
 */
export const useSubgraphPairs = (pairAddresses: (string | undefined)[]) => {
  const pairsToFind = pairAddresses.filter((item) => !!item) as string[];
  const chainId = useChainId();
  // get pairs from subgraph
  return useQuery<SubgraphPair[]>(['get-subgraph-pairs', chainId, ...pairsToFind], async () => {
    const gqlClient = subgraphClient[chainId];
    if (!gqlClient) {
      return null;
    }
    const data = await gqlClient.request(GET_PAIRS, { pairAddresses: pairsToFind });
    return data?.pairs;
  });
};
