import { ChainId } from '@pangolindex/sdk';
import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { getGovernanceSubgraphApolloClient } from 'src/apollo/client';

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

export const getAllProposalData = async (chainId: ChainId, id?: string) => {
  const governanceClient = getGovernanceSubgraphApolloClient(chainId);
  if (!governanceClient) {
    return null;
  }

  let data = [] as Array<any>;

  try {
    const queryData: any = {
      query: GET_PROPOSALS,
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
