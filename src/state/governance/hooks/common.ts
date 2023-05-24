import { JSBI } from '@pangolindex/sdk';
import { ethers, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { getAllProposalData } from 'src/apollo/vote';
import { useChainId } from 'src/hooks';
import { useAllProposalDataHook } from 'src/state/governance/hooks';
import { ProposalData, ProposalState } from '../types';

export const enumerateProposalState = (state: number) => {
  const proposalStates = ['pending', 'active', 'canceled', 'defeated', 'succeeded', 'queued', 'expired', 'executed'];
  return proposalStates[state];
};

export const getProposalState = (proposal: ProposalData) => {
  const currentTimestamp = () => Math.floor(Date.now() / 1000);

  if (proposal.canceled) {
    return ProposalState.canceled;
  } else if (currentTimestamp() <= proposal.startTime) {
    return ProposalState.pending;
  } else if (currentTimestamp() <= proposal.endTime) {
    return ProposalState.active;
  } else if (
    proposal.againstCount &&
    JSBI.lessThanOrEqual(JSBI.BigInt(proposal.forCount), JSBI.BigInt(proposal?.againstCount || 0))
  ) {
    return ProposalState.defeated;
  } else if (proposal.eta === 0) {
    return ProposalState.succeeded;
  } else if (proposal.executed) {
    return ProposalState.executed;
    // } else if (block.timestamp >= add256(proposal.eta, timelock.GRACE_PERIOD())) {
    //     return ProposalState.expired;
  } else {
    return ProposalState.queued;
  }
};

// get data for all past and active proposals
export function useGetProposalsViaSubgraph(id?: string) {
  const chainId = useChainId();
  const [allProposalsData, setAllProposalsData] = useState<Array<ProposalData>>([]);

  useEffect(() => {
    async function checkForChartData() {
      const allProposals = await getAllProposalData(chainId, id);

      if (allProposals) {
        const allData = allProposals.map((proposal) => {
          const details = (proposal?.targets || []).map((target: string, i: number) => {
            const signature = proposal?.signatures[i];

            const [name, types] = signature?.substr(0, signature?.length - 1)?.split('(');

            const calldata = proposal?.calldatas[i];

            const decoded = utils.defaultAbiCoder.decode(types.split(','), calldata);

            return {
              target,
              functionSig: name,
              callData: decoded.join(', '),
            };
          });

          return {
            id: proposal?.id.toString(),
            title: proposal?.description?.split(/# |\n/g)[1] || 'Untitled',
            description: proposal?.description || 'No description.',
            proposer: proposal?.proposer,
            status:
              getProposalState({ ...proposal, forCount: proposal?.forVotes, againstCount: proposal?.againstVotes }) ??
              'Undetermined',
            forCount: proposal?.forVotes ? parseFloat(ethers.utils.formatUnits(proposal?.forVotes.toString(), 18)) : 0,
            againstCount: proposal?.againstVotes
              ? parseFloat(ethers.utils.formatUnits(proposal?.againstVotes.toString(), 18))
              : 0,
            startTime: parseInt(proposal?.startTime?.toString()),
            endTime: parseInt(proposal?.endTime?.toString()),
            details: details,
          };
        });

        setAllProposalsData(allData);
      }
    }

    checkForChartData().catch((error) => console.error(error));
  }, [id, chainId]);

  return allProposalsData;
}

export function useGetProposalDetailViaSubgraph(id: string): ProposalData | undefined {
  const allProposalData = useGetProposalsViaSubgraph(id);
  return allProposalData?.find((p: ProposalData) => p.id === id);
}

export function useProposalData(id: string): ProposalData | undefined {
  const chainId = useChainId();

  const useAllProposalData = useAllProposalDataHook[chainId];

  const allProposalData = useAllProposalData();
  return allProposalData?.find((p) => p.id === id);
}
