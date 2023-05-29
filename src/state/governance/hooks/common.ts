import { JSBI } from '@pangolindex/sdk';
import { ethers, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { NFT_PROPOSAL, getAllProposalData } from 'src/apollo/vote';
import { PROPOSAL_STORAGE_INTERFACE } from 'src/constants/governance/proposalStorage';
import { useChainId } from 'src/hooks';
import { useSarNftGovernanceAssistantContract, useSarNftGovernanceContract } from 'src/hooks/useContract';
import { useAllProposalDataHook } from 'src/state/governance/hooks';
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'src/state/pmulticall/hooks';
import { ProposalData, ProposalState } from '../types';

export const enumerateProposalState = (state: number) => {
  const proposalStates = ['pending', 'active', 'canceled', 'defeated', 'succeeded', 'queued', 'expired', 'executed'];
  return proposalStates[state];
};

export const getProposalState = (proposal: NFT_PROPOSAL) => {
  const currentTimestamp = () => Math.floor(Date.now() / 1000);

  if (proposal.canceled) {
    return ProposalState.canceled;
  } else if (currentTimestamp() <= proposal.startTime) {
    return ProposalState.pending;
  } else if (currentTimestamp() <= proposal.endTime) {
    return ProposalState.active;
  } else if (
    proposal.againstVotes &&
    JSBI.lessThanOrEqual(JSBI.BigInt(proposal.forVotes), JSBI.BigInt(proposal?.againstVotes || 0))
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

            const [name, types] = signature?.substr(0, signature?.length - 1)?.split('(') || [];

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
            status: getProposalState({ ...proposal }) ?? 'Undetermined',
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

// get count of all proposals made
export function useProposalCount(): number | undefined {
  const gov = useSarNftGovernanceContract();
  const res = useSingleCallResult(gov, 'proposalCount');
  if (res.result && !res.loading) {
    return parseInt(res.result[0]) ?? 0;
  }
  return undefined;
}

// get data for all past and active proposals
export function useSarNftAllProposalData() {
  const proposalCount = useProposalCount();
  const govContract = useSarNftGovernanceContract();
  const govAssistantContract = useSarNftGovernanceAssistantContract();

  const proposalIndexes = [] as any;
  for (let i = 1; i <= (proposalCount ?? 0); i++) {
    proposalIndexes.push([i]);
  }

  // get all proposal entities
  const allProposalsAddressesState = useSingleContractMultipleData(
    govAssistantContract,
    'locateProposal',
    proposalIndexes,
  );

  // get the address of the rewarder for each pool
  const allProposalsAddresses = useMemo(() => {
    if ((allProposalsAddressesState || []).length === 0) return [];
    return allProposalsAddressesState.map((proposal) => {
      if (!!proposal?.result?.address) {
        return proposal?.result?.address;
      }
      return undefined;
    });
  }, [allProposalsAddressesState]);

  const allProposals = useMultipleContractSingleData(
    allProposalsAddresses,
    PROPOSAL_STORAGE_INTERFACE,
    'getProposal',
    [],
  );

  // get all proposal states
  const allProposalStates = useSingleContractMultipleData(govContract, 'state', proposalIndexes);

  if (allProposals && allProposalStates) {
    allProposals.reverse();
    allProposalStates.reverse();

    return allProposals
      .filter((p, i) => {
        return Boolean(p.result) && Boolean(allProposalStates[i]?.result);
      })
      .map((_p, i) => {
        const description = allProposals[i]?.result?.description;

        const details = (allProposals[i]?.result?.targets || []).map((target: string, i: number) => {
          const signature = allProposals[i]?.result?.signatures[i];

          const [name, types] = signature?.substr(0, signature?.length - 1)?.split('(') || [];

          const calldata = allProposals[i]?.result?.calldatas[i];

          const decoded = utils.defaultAbiCoder.decode(types.split(','), calldata);

          return {
            target,
            functionSig: name,
            callData: decoded.join(', '),
          };
        });

        const formattedProposal: ProposalData = {
          id: allProposals[i]?.result?.id.toString(),
          title: description?.split(/# |\n/g)[1] || 'Untitled',
          description: description || 'No description.',
          status: enumerateProposalState(allProposalStates[i]?.result?.[0]) ?? 'Undetermined',
          forCount: parseFloat(ethers.utils.formatUnits(allProposals[i]?.result?.forVotes.toString(), 18)),
          againstCount: parseFloat(ethers.utils.formatUnits(allProposals[i]?.result?.againstVotes.toString(), 18)),
          startTime: parseInt(allProposals[i]?.result?.startTime?.toString()),
          endTime: parseInt(allProposals[i]?.result?.endTime?.toString()),
          startBlock: parseInt(allProposals[i]?.result?.startBlock?.toString()),
          details: details,
        };
        return formattedProposal;
      });
  } else {
    return [];
  }
}
