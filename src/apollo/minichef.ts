import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default

export const GET_MINICHEF = gql`
  query minichefs($where: Minichef_filter, $userAddress: String) {
    minichefs(where: $where) {
      id
      totalAllocPoint
      rewardPerSecond
      rewardsExpiration
      farms {
        id
        pid
        tvl
        allocPoint
        rewarderAddress
        chefAddress
        pairAddress
        rewarder {
          id
          rewards {
            id
            token {
              id
              symbol
              derivedUSD
              derivedETH
              name
              decimals
            }
            multiplier
          }
        }
        pair {
          id
          reserve0
          reserve1
          totalSupply
          token0 {
            id
            symbol
            derivedUSD
            derivedETH
            name
            decimals
          }
          token1 {
            id
            symbol
            derivedUSD
            derivedETH
            name
            decimals
          }
        }
        farmingPositions(where: { userAddress: $userAddress }) {
          id
          stakedTokenBalance
        }
      }
    }
  }
`;
