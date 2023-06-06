import { CHAINS, ChainId, GovernanceType } from '@pangolindex/sdk';
import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { getGovernanceSubgraphApolloClient } from 'src/apollo/client';

export type NFT_PROPOSAL = {
  id: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  proposer?: string;
  forVotes: number;
  againstVotes: number;
  startTime: number;
  endTime: number;
  eta: any;
  description: string;
  executed: boolean;
  canceled: boolean;
};

export const GET_PROPOSALS = gql`
  query proposals($where: Proposal_filter) {
    proposals(orderBy: startTime, orderDirection: desc, where: $where) {
      id
      description
      eta
      startTime
      endTime
      proposer
      calldatas
      signatures
      forVotes
      againstVotes
      canceled
      executed
      targets
    }
  }
`;

export const GET_NFT_GOVERNANCE_PROPOSALS = gql`
  query proposals($where: Proposal_filter) {
    proposals(orderBy: startTime, orderDirection: desc, where: $where) {
      id
      description
      eta
      startTime
      endTime
      calldatas
      signatures
      forVotes
      againstVotes
      canceled
      executed
      targets
    }
  }
`;

export const getAllProposalData = async (chainId: ChainId, id?: string) => {
  const governanceClient = getGovernanceSubgraphApolloClient(chainId);

  if (!governanceClient) {
    return null;
  }

  let data = [] as Array<NFT_PROPOSAL>;

  try {
    const queryData: any = {
      query:
        CHAINS[chainId]?.contracts?.governor?.type === GovernanceType.SAR_NFT
          ? GET_NFT_GOVERNANCE_PROPOSALS
          : GET_PROPOSALS,
      fetchPolicy: 'cache-first',
    };

    if (id) {
      queryData['variables'] = { where: { id: id } };
    }
    const result = await governanceClient.query(queryData);

    data = result?.data?.proposals;
  } catch (e) {
    console.log(e);
  }

  return data;
};
