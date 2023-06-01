import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default

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
