/* eslint-disable max-lines */
import { useChainId } from '@honeycomb-finance/shared';
import { ChainId } from '@pangolindex/sdk';
import { useAllProposalDataViaSubgraph } from './common';
import { useDummyAllProposalData, useDummyVoteCallback } from './dummy';
import { useAllProposalData, useVoteCallback } from './evm';
import { useHederaVoteCallback } from './hedera';
import { ProposalData } from './types';

export type UseAllProposalDataHookType = {
  [chainId in ChainId]:
    | typeof useAllProposalDataViaSubgraph
    | typeof useAllProposalData
    | typeof useDummyAllProposalData;
};

export const useAllProposalDataHook: UseAllProposalDataHookType = {
  [ChainId.FUJI]: useDummyAllProposalData,
  [ChainId.AVALANCHE]: useAllProposalData,
  [ChainId.WAGMI]: useDummyAllProposalData,
  [ChainId.COSTON]: useAllProposalDataViaSubgraph,
  [ChainId.SONGBIRD]: useAllProposalDataViaSubgraph,
  [ChainId.FLARE_MAINNET]: useAllProposalDataViaSubgraph,
  [ChainId.HEDERA_TESTNET]: useAllProposalDataViaSubgraph,
  [ChainId.HEDERA_MAINNET]: useAllProposalDataViaSubgraph,
  [ChainId.NEAR_MAINNET]: useDummyAllProposalData,
  [ChainId.NEAR_TESTNET]: useDummyAllProposalData,
  [ChainId.COSTON2]: useAllProposalDataViaSubgraph,
  [ChainId.EVMOS_TESTNET]: useDummyAllProposalData,
  [ChainId.EVMOS_MAINNET]: useDummyAllProposalData,
  // TODO: We need to check following chains
  [ChainId.ETHEREUM]: useDummyAllProposalData,
  [ChainId.POLYGON]: useDummyAllProposalData,
  [ChainId.FANTOM]: useDummyAllProposalData,
  [ChainId.XDAI]: useDummyAllProposalData,
  [ChainId.BSC]: useDummyAllProposalData,
  [ChainId.ARBITRUM]: useDummyAllProposalData,
  [ChainId.CELO]: useDummyAllProposalData,
  [ChainId.OKXCHAIN]: useDummyAllProposalData,
  [ChainId.VELAS]: useDummyAllProposalData,
  [ChainId.AURORA]: useDummyAllProposalData,
  [ChainId.CRONOS]: useDummyAllProposalData,
  [ChainId.FUSE]: useDummyAllProposalData,
  [ChainId.MOONRIVER]: useDummyAllProposalData,
  [ChainId.MOONBEAM]: useDummyAllProposalData,
  [ChainId.OP]: useDummyAllProposalData,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyAllProposalData,
};

export type UseVoteCallbackHookType = {
  [chainId in ChainId]: typeof useVoteCallback | typeof useHederaVoteCallback | typeof useDummyVoteCallback;
};

export const useVoteCallbackHook: UseVoteCallbackHookType = {
  [ChainId.FUJI]: useDummyVoteCallback,
  [ChainId.AVALANCHE]: useVoteCallback,
  [ChainId.WAGMI]: useDummyVoteCallback,
  [ChainId.COSTON]: useDummyVoteCallback,
  [ChainId.SONGBIRD]: useDummyVoteCallback,
  [ChainId.FLARE_MAINNET]: useDummyVoteCallback,
  [ChainId.HEDERA_TESTNET]: useHederaVoteCallback,
  [ChainId.HEDERA_MAINNET]: useDummyVoteCallback,
  [ChainId.NEAR_MAINNET]: useDummyVoteCallback,
  [ChainId.NEAR_TESTNET]: useDummyVoteCallback,
  [ChainId.COSTON2]: useDummyVoteCallback,
  [ChainId.EVMOS_TESTNET]: useDummyVoteCallback,
  [ChainId.EVMOS_MAINNET]: useDummyVoteCallback,
  // TODO: We need to check following chains
  [ChainId.ETHEREUM]: useDummyVoteCallback,
  [ChainId.POLYGON]: useDummyVoteCallback,
  [ChainId.FANTOM]: useDummyVoteCallback,
  [ChainId.XDAI]: useDummyVoteCallback,
  [ChainId.BSC]: useDummyVoteCallback,
  [ChainId.ARBITRUM]: useDummyVoteCallback,
  [ChainId.CELO]: useDummyVoteCallback,
  [ChainId.OKXCHAIN]: useDummyVoteCallback,
  [ChainId.VELAS]: useDummyVoteCallback,
  [ChainId.AURORA]: useDummyVoteCallback,
  [ChainId.CRONOS]: useDummyVoteCallback,
  [ChainId.FUSE]: useDummyVoteCallback,
  [ChainId.MOONRIVER]: useDummyVoteCallback,
  [ChainId.MOONBEAM]: useDummyVoteCallback,
  [ChainId.OP]: useDummyVoteCallback,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyVoteCallback,
};

export function useProposalData(id: string): ProposalData | undefined {
  const chainId = useChainId();

  const useAllProposalData = useAllProposalDataHook[chainId];

  const allProposalData = useAllProposalData();
  return allProposalData?.find((p) => p.id === id);
}
