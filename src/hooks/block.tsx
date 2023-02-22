import { CHAINS, ChainId } from '@pangolindex/sdk';
import axios from 'axios';
import { useQuery } from 'react-query';
import { GET_LAST_BLOCK } from 'src/apollo/block';
import { blockClientsMapping } from 'src/apollo/client';
import { useChainId } from '.';

/**
 * This hook get a timestamp of the last block via json-rpc
 * @returns timestamp of last block
 */
export function useGetLastBlockTimestamp() {
  const chainId = useChainId();
  const chain = CHAINS[chainId];

  const { data: timestamp } = useQuery(
    ['get-block-timestamp-lastest', chainId],
    async () => {
      const response = await axios.post(chain.rpc_uri, {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
        id: 1,
      });
      const data = response.data;
      return parseInt(data?.result?.timestamp, 16);
    },
    {
      refetchInterval: 1000 * 60, //1 minute
      staleTime: 1000 * 60, //1 minute
    },
  );

  return timestamp;
}

/**
 * This hook get a timestamp of the last block via subgraph
 * @returns timestamp of last block
 */
export function useGetLastBlockTimestampViaSubgraph() {
  const chainId = useChainId();

  const { data: timestamp } = useQuery(
    ['get-block-timestamp-subgraph-lastest', chainId],
    async () => {
      const client = blockClientsMapping[chainId];

      if (!client) return undefined;

      const data: {
        _meta: {
          block: {
            number: number;
            hash: string;
            timestamp: number;
          };
        };
      } = await client.request(GET_LAST_BLOCK);
      return data._meta.block.timestamp;
    },
    {
      refetchInterval: 1000 * 60, //1 minute
      staleTime: 1000 * 60, //1 minute
    },
  );

  return timestamp;
}

export type useGetLastBlockTimestampType = {
  [chainId in ChainId]: typeof useGetLastBlockTimestamp | typeof useGetLastBlockTimestampViaSubgraph;
};

export const useGetLastBlockTimestampHook: useGetLastBlockTimestampType = {
  [ChainId.AVALANCHE]: useGetLastBlockTimestampViaSubgraph,
  [ChainId.FUJI]: useGetLastBlockTimestamp,
  [ChainId.WAGMI]: useGetLastBlockTimestamp,
  [ChainId.COSTON]: useGetLastBlockTimestamp,
  [ChainId.SONGBIRD]: useGetLastBlockTimestamp,
  [ChainId.FLARE_MAINNET]: useGetLastBlockTimestamp,
  [ChainId.HEDERA_TESTNET]: useGetLastBlockTimestampViaSubgraph,
  [ChainId.HEDERA_MAINNET]: useGetLastBlockTimestampViaSubgraph,
  [ChainId.NEAR_MAINNET]: useGetLastBlockTimestamp,
  [ChainId.NEAR_TESTNET]: useGetLastBlockTimestamp,
  [ChainId.COSTON2]: useGetLastBlockTimestamp,
  [ChainId.EVMOS_TESTNET]: useGetLastBlockTimestamp,
  [ChainId.ETHEREUM]: useGetLastBlockTimestamp,
  [ChainId.POLYGON]: useGetLastBlockTimestamp,
  [ChainId.FANTOM]: useGetLastBlockTimestamp,
  [ChainId.XDAI]: useGetLastBlockTimestamp,
  [ChainId.BSC]: useGetLastBlockTimestamp,
  [ChainId.ARBITRUM]: useGetLastBlockTimestamp,
  [ChainId.CELO]: useGetLastBlockTimestamp,
  [ChainId.OKXCHAIN]: useGetLastBlockTimestamp,
  [ChainId.VELAS]: useGetLastBlockTimestamp,
  [ChainId.AURORA]: useGetLastBlockTimestamp,
  [ChainId.CRONOS]: useGetLastBlockTimestamp,
  [ChainId.FUSE]: useGetLastBlockTimestamp,
  [ChainId.MOONRIVER]: useGetLastBlockTimestamp,
  [ChainId.MOONBEAM]: useGetLastBlockTimestamp,
  [ChainId.OP]: useGetLastBlockTimestamp,
};
