import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useQuery } from 'react-query';
import { useChainId } from 'src/hooks';
import { SubgraphEnum, useSubgraphClient } from './client';

export const GET_BLOCKS = (timestamps) => {
  let queryString = 'query blocks {';
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: asc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 60 * 60 * 24 * 7
    } }) {
      number
    }`;
  });
  queryString += '}';
  return gql(queryString);
};

export const PRICES_BY_BLOCK = (tokenAddress, blocks) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) { 
        derivedETH
      }
    `,
  );
  queryString += ',';
  queryString += blocks.map(
    (block) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) { 
        ethPrice
      }
    `,
  );

  queryString += '}';
  return gql(queryString);
};

export const GET_LAST_BLOCK = gql`
  query block {
    _meta {
      block {
        number
        hash
        timestamp
      }
    }
  }
`;

export interface SubgraphBlock {
  number: number;
  hash: string;
  timestamp: number;
}

export interface SubgraphLastBlockResponse {
  _meta: {
    block: SubgraphBlock;
  };
}

/**
 * This hook get the block number, hash and timestamp of the last block via subgraph
 * @returns return simple data of the block
 */
export function useLastSubgraphBlock() {
  const chainId = useChainId();
  const client = useSubgraphClient(SubgraphEnum.Exchange);
  const { data: block } = useQuery(
    ['get-last-block-subgraph', chainId],
    async () => {
      if (!client) return undefined;

      const data = await client.request<SubgraphLastBlockResponse>(GET_LAST_BLOCK);
      return data._meta.block;
    },
    {
      refetchInterval: 1000 * 20, //20 seconds
      staleTime: 1000 * 20, //20 seconds
    },
  );

  return block;
}
