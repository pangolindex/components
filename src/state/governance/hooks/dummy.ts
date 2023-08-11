import { BigNumber } from 'ethers';
import { ProposalData } from '../types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const useDummyAllProposalData = () => {
  return [] as ProposalData[];
};

export function useDummyVoteCallback(): {
  voteCallback: (proposalId: string | undefined, support: boolean, nftId?: BigNumber) => Promise<string> | undefined;
} {
  return { voteCallback: () => undefined };
}
