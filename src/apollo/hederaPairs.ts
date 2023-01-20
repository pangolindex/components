import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default

export const GET_PAIRS_RESERVES = gql`
  query pairs($where: Pair_filter, $pairAddresses: [String]) {
    pairs(where: { id_in: $pairAddresses }) {
      id
      reserve0
      reserve1
    }
  }
`;
