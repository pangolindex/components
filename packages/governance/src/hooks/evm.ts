import { TransactionResponse } from '@ethersproject/providers';
import {
  GET_BLOCK,
  PNG,
  SubgraphEnum,
  calculateGasMargin,
  getSubgraphClient,
  useChainId,
  useLibrary,
  usePangolinWeb3,
} from '@honeycomb-finance/shared';
import {
  useSingleCallResult,
  useSingleContractMultipleData,
  useTransactionAdder,
} from '@honeycomb-finance/state-hooks';
import { ChainId, TokenAmount } from '@pangolindex/sdk';
import { ethers, utils } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { GovernorABI } from 'src/constants';
import { enumerateProposalState } from './common';
import { ProposalData } from './types';
import { useGovernanceContract, usePngContract } from './useContract';

// get count of all proposals made
export function useProposalCount(): number | undefined {
  const gov = useGovernanceContract();
  const res = useSingleCallResult(gov, 'proposalCount');
  if (res.result && !res.loading) {
    return parseInt(res.result[0]) ?? 0;
  }
  return undefined;
}

/**
 * @notice Fetches first block after a given timestamp
 * @dev Query speed is optimized by limiting to a 600-second period
 * @param {Number} timestamp in seconds
 */
export async function getBlockFromTimestamp(timestamp: number, chainId: ChainId) {
  const blockClient = getSubgraphClient(chainId, SubgraphEnum.Blocks);
  if (!blockClient) {
    return null;
  }

  const result = await blockClient.request(GET_BLOCK, {
    timestampFrom: timestamp,
    timestampTo: timestamp + 60 * 60 * 24 * 7,
  });
  return result?.data?.blocks?.[0]?.number;
}

/**
 * Need proposal events to get description data emitted from
 * new proposal event.
 */
export function useDataFromEventLogs() {
  const { library } = useLibrary();
  const chainId = useChainId();
  const [formattedEvents, setFormattedEvents] = useState<any>();
  const govContract = useGovernanceContract();

  const proposalCount = useProposalCount();

  const proposalIndexes = [] as any;
  for (let i = 1; i <= (proposalCount ?? 0); i++) {
    proposalIndexes.push([i]);
  }

  const allProposals = useSingleContractMultipleData(govContract, 'proposals', proposalIndexes);

  useEffect(() => {
    const voteDelay: number = 60 * 60 * 24;
    const eventParser = new ethers.utils.Interface(GovernorABI);

    async function fetchData() {
      let pastEvents = [] as any[];

      for (const proposal of allProposals) {
        const startTime: number = parseInt(proposal?.result?.startTime?.toString());
        if (startTime) {
          const eventTime: number = startTime - voteDelay;
          const block: number = parseInt(await getBlockFromTimestamp(eventTime, chainId)); // Actual returns the "next" block
          const filter = {
            ...govContract?.filters?.['ProposalCreated'](),
            fromBlock: block - 10,
            toBlock: block + 10,
          };
          pastEvents = pastEvents.concat(await library?.getLogs(filter));
        }
      }

      const formattedEventData = pastEvents
        ?.map((event) => eventParser.parseLog(event).args)
        ?.map((eventParsed) => ({
          description: eventParsed.description,
          details: eventParsed.targets.map((target: string, i: number) => {
            const signature = eventParsed.signatures[i];
            const [name, types] = signature.substr(0, signature.length - 1).split('(') || [];

            const calldata = eventParsed.calldatas[i];
            const decoded = utils.defaultAbiCoder.decode(types.split(','), calldata);

            return {
              target,
              functionSig: name,
              callData: decoded.join(', '),
            };
          }),
        }))
        .reverse(); // reverse events to get them from newest to oldest

      setFormattedEvents(formattedEventData);
    }

    if (
      library &&
      govContract &&
      proposalCount !== undefined &&
      allProposals &&
      allProposals.length === proposalCount &&
      allProposals.every((proposal) => !proposal.loading) &&
      !formattedEvents
    ) {
      fetchData().catch((error) => console.error(error));
    }
  }, [library, govContract, proposalCount, allProposals, formattedEvents, chainId]);

  return formattedEvents;
}

// get data for all past and active proposals
export function useAllProposalData() {
  const proposalCount = useProposalCount();
  const govContract = useGovernanceContract();

  const proposalIndexes = [] as any;
  for (let i = 1; i <= (proposalCount ?? 0); i++) {
    proposalIndexes.push([i]);
  }

  // get metadata from past events
  const formattedEvents = useDataFromEventLogs();

  // get all proposal entities
  const allProposals = useSingleContractMultipleData(govContract, 'proposals', proposalIndexes);
  // get all proposal states
  const allProposalStates = useSingleContractMultipleData(govContract, 'state', proposalIndexes);

  if (formattedEvents && allProposals && allProposalStates) {
    allProposals.reverse();
    allProposalStates.reverse();

    return allProposals
      .filter((p, i) => {
        return Boolean(p.result) && Boolean(allProposalStates[i]?.result) && Boolean(formattedEvents[i]);
      })
      .map((_p, i) => {
        const description = formattedEvents[i].description;

        const formattedProposal: ProposalData = {
          id: allProposals[i]?.result?.id.toString(),
          title: description?.split(/# |\n/g)[1] || 'Untitled',
          description: description || 'No description.',
          proposer: allProposals[i]?.result?.proposer,
          status: enumerateProposalState(allProposalStates[i]?.result?.[0]) ?? 'Undetermined',
          forCount: parseFloat(ethers.utils.formatUnits(allProposals[i]?.result?.forVotes.toString(), 18)),
          againstCount: parseFloat(ethers.utils.formatUnits(allProposals[i]?.result?.againstVotes.toString(), 18)),
          startTime: parseInt(allProposals[i]?.result?.startTime?.toString()),
          endTime: parseInt(allProposals[i]?.result?.endTime?.toString()),
          startBlock: parseInt(allProposals[i]?.result?.startBlock?.toString()),
          details: formattedEvents[i].details,
        };
        return formattedProposal;
      });
  } else {
    return [];
  }
}

// get the users delegatee if it exists
export function useUserDelegate(): string {
  const { account } = usePangolinWeb3();
  const uniContract = usePngContract();
  const { result } = useSingleCallResult(uniContract, 'delegates', [account ?? undefined]);
  return result?.[0] ?? undefined;
}

export function useUserVotes(): TokenAmount | undefined {
  const { account, chainId } = usePangolinWeb3();
  const pngContract = usePngContract();

  // check for available votes
  const png = chainId ? PNG[chainId] : undefined;
  const votes = useSingleCallResult(pngContract, 'getCurrentVotes', [account ?? undefined])?.result?.[0];
  return votes && png ? new TokenAmount(png, votes) : undefined;
}

export function useDelegateCallback(): (delegatee: string | undefined) => undefined | Promise<string> {
  const { account, chainId } = usePangolinWeb3();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();

  const uniContract = usePngContract();

  return useCallback(
    (delegatee: string | undefined) => {
      if (!library || !chainId || !account || !isAddress(delegatee ?? '')) return undefined;
      const args = [delegatee];
      if (!uniContract) throw new Error('No UNI Contract!');
      return uniContract.estimateGas.delegate(...args, {}).then((estimatedGasLimit: any) => {
        return uniContract
          .delegate(...args, { value: null, gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Delegated votes`,
            });
            return response.hash;
          });
      });
    },
    [account, addTransaction, chainId, library, uniContract],
  );
}

export function useVoteCallback(): {
  voteCallback: (proposalId: string | undefined, support: boolean) => undefined | Promise<string>;
} {
  const { account } = usePangolinWeb3();

  const govContract = useGovernanceContract();
  const addTransaction = useTransactionAdder();

  const voteCallback = useCallback(
    (proposalId: string | undefined, support: boolean) => {
      if (!account || !govContract || !proposalId) return;
      const args = [proposalId, support];
      return govContract.estimateGas.castVote(...args, {}).then((estimatedGasLimit: any) => {
        return govContract
          .castVote(...args, { value: null, gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Voted ${support ? 'for ' : 'against'} proposal ${proposalId}`,
            });
            return response.hash;
          });
      });
    },
    [account, addTransaction, govContract],
  );
  return { voteCallback };
}
