import { CHAINS, ChainId } from '@pangolindex/sdk';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useLastSubgraphBlock } from 'src/apollo/block';
import { useChainId } from '.';

export type RPCResponse<T> = {
  jsonrpc: string;
  id: number;
  result: T;
};

export interface Block {
  hash: string;
  parentHash: string;
  number: number;

  timestamp: number;
  nonce: string;
  difficulty: number;

  gasLimit: string;
  gasUsed: string;

  miner: string;
  extraData: string;

  transactions: Array<string>;
}

interface RpcBlock extends Omit<Block, 'number' | 'difficulty' | 'timestamp'> {
  number: string;
  difficulty: string;
  timestamp: string;
}

type BlockReponse = RPCResponse<RpcBlock>;

/**
 * This hook return the block data from json rpc
 * @returns The block data
 */
export function useLastBlock() {
  const chainId = useChainId();
  const chain = CHAINS[chainId];

  const { data: block } = useQuery(
    ['get-last-block-rpc', chainId],
    async () => {
      const response = await axios.post<BlockReponse>(chain.rpc_uri, {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
        id: 1,
      });

      const data = response.data;

      const result: Block = {
        ...data?.result,
        number: parseInt(data?.result.number, 16),
        timestamp: parseInt(data?.result.timestamp, 16),
        difficulty: parseInt(data?.result.difficulty, 16),
      };

      return result;
    },
    {
      refetchInterval: 1000 * 20, //20 seconds
      staleTime: 1000 * 20, //20 seconds
    },
  );

  return block;
}

export type useLastBlockType = {
  [chainId in ChainId]: typeof useLastBlock | typeof useLastSubgraphBlock;
};

export const useLastBlockHook: useLastBlockType = {
  [ChainId.AVALANCHE]: useLastSubgraphBlock,
  [ChainId.FUJI]: useLastBlock,
  [ChainId.WAGMI]: useLastBlock,
  [ChainId.COSTON]: useLastBlock,
  [ChainId.SONGBIRD]: useLastBlock,
  [ChainId.FLARE_MAINNET]: useLastBlock,
  [ChainId.HEDERA_TESTNET]: useLastSubgraphBlock,
  [ChainId.HEDERA_MAINNET]: useLastSubgraphBlock,
  [ChainId.NEAR_MAINNET]: useLastBlock,
  [ChainId.NEAR_TESTNET]: useLastBlock,
  [ChainId.COSTON2]: useLastBlock,
  [ChainId.EVMOS_TESTNET]: useLastBlock,
  [ChainId.ETHEREUM]: useLastBlock,
  [ChainId.POLYGON]: useLastBlock,
  [ChainId.FANTOM]: useLastBlock,
  [ChainId.XDAI]: useLastBlock,
  [ChainId.BSC]: useLastBlock,
  [ChainId.ARBITRUM]: useLastBlock,
  [ChainId.CELO]: useLastBlock,
  [ChainId.OKXCHAIN]: useLastBlock,
  [ChainId.VELAS]: useLastBlock,
  [ChainId.AURORA]: useLastBlock,
  [ChainId.CRONOS]: useLastBlock,
  [ChainId.FUSE]: useLastBlock,
  [ChainId.MOONRIVER]: useLastBlock,
  [ChainId.MOONBEAM]: useLastBlock,
  [ChainId.OP]: useLastBlock,
};

/**
 * This hook get a timestamp of the last block via json-rpc
 * @returns timestamp of last block
 */
export function useLastBlockTimestamp() {
  const block = useLastBlock();
  return block?.timestamp;
}

/**
 * This hook get a timestamp of the last block via subgraph
 * @returns timestamp of last block
 */
export function useLastBlockTimestampViaSubgraph() {
  const block = useLastSubgraphBlock();
  return block?.timestamp;
}

export type useLastBlockTimestampType = {
  [chainId in ChainId]: typeof useLastBlockTimestamp | typeof useLastBlockTimestampViaSubgraph;
};

export const useLastBlockTimestampHook: useLastBlockTimestampType = {
  [ChainId.AVALANCHE]: useLastBlockTimestampViaSubgraph,
  [ChainId.FUJI]: useLastBlockTimestamp,
  [ChainId.WAGMI]: useLastBlockTimestamp,
  [ChainId.COSTON]: useLastBlockTimestamp,
  [ChainId.SONGBIRD]: useLastBlockTimestamp,
  [ChainId.FLARE_MAINNET]: useLastBlockTimestamp,
  [ChainId.HEDERA_TESTNET]: useLastBlockTimestampViaSubgraph,
  [ChainId.HEDERA_MAINNET]: useLastBlockTimestampViaSubgraph,
  [ChainId.NEAR_MAINNET]: useLastBlockTimestamp,
  [ChainId.NEAR_TESTNET]: useLastBlockTimestamp,
  [ChainId.COSTON2]: useLastBlockTimestamp,
  [ChainId.EVMOS_TESTNET]: useLastBlockTimestamp,
  [ChainId.ETHEREUM]: useLastBlockTimestamp,
  [ChainId.POLYGON]: useLastBlockTimestamp,
  [ChainId.FANTOM]: useLastBlockTimestamp,
  [ChainId.XDAI]: useLastBlockTimestamp,
  [ChainId.BSC]: useLastBlockTimestamp,
  [ChainId.ARBITRUM]: useLastBlockTimestamp,
  [ChainId.CELO]: useLastBlockTimestamp,
  [ChainId.OKXCHAIN]: useLastBlockTimestamp,
  [ChainId.VELAS]: useLastBlockTimestamp,
  [ChainId.AURORA]: useLastBlockTimestamp,
  [ChainId.CRONOS]: useLastBlockTimestamp,
  [ChainId.FUSE]: useLastBlockTimestamp,
  [ChainId.MOONRIVER]: useLastBlockTimestamp,
  [ChainId.MOONBEAM]: useLastBlockTimestamp,
  [ChainId.OP]: useLastBlockTimestamp,
};
