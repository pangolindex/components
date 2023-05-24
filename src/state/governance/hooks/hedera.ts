import { BigNumber, ethers, utils } from 'ethers';
import { useMemo } from 'react';
import { PROPOSAL_STORAGE_INTERFACE } from 'src/constants/governance/proposalStorage';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useHederaGovernanceAssistantContract, useHederaGovernanceContract } from 'src/hooks/useContract';
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'src/state/pmulticall/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { hederaFn } from 'src/utils/hedera';
import { ProposalData } from '../types';
import { enumerateProposalState } from './common';

// get count of all proposals made
export function useProposalCount(): number | undefined {
  const gov = useHederaGovernanceContract();
  const res = useSingleCallResult(gov, 'proposalCount');
  if (res.result && !res.loading) {
    return parseInt(res.result[0]) ?? 0;
  }
  return undefined;
}

// get data for all past and active proposals
export function useHederaAllProposalData() {
  const proposalCount = useProposalCount();
  const govContract = useHederaGovernanceContract();
  const govAssistantContract = useHederaGovernanceAssistantContract();

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

          const [name, types] = signature?.substr(0, signature?.length - 1)?.split('(');

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

export function useHederaVoteCallback(): {
  voteCallback: (
    proposalId: string | undefined,
    support: boolean,
    nftId?: BigNumber,
  ) => undefined | Promise<string | undefined>;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const govContract = useHederaGovernanceContract();
  const addTransaction = useTransactionAdder();

  const voteCallback = async (proposalId: string | undefined, support: boolean, nftId?: BigNumber) => {
    console.log('proposalId', proposalId);
    console.log('support', support);
    console.log('nftId', nftId);

    if (!account || !govContract || !proposalId || !nftId) return;

    try {
      const args = {
        proposalId,
        support,
        nftId: nftId?.toString(),
        account,
        chainId,
      };

      const response = await hederaFn.castVote(args);
      if (response) {
        addTransaction(response, {
          summary: `Voted ${support ? 'for ' : 'against'} proposal ${proposalId}`,
        });

        return response?.hash;
      }
      return;
    } catch (err) {
      const _err = err as any;
      // we only care if the error is something _other_ than the user rejected the tx
      if (_err?.code !== 4001) {
        console.error(_err);
      }
    }
  };

  return { voteCallback };
}
