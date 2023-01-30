import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default

export const GET_PANGOCHEF = gql`
  query pangoChefs($where: PangoChef_filter, $userAddress: String) {
    pangoChefs(where: $where) {
      id
      totalWeight
      rewardRate
      periodFinish
      periodDuration
      totalRewardAdded
      farms {
        id
        pid
        tvl
        weight
        tokenOrRecipientAddress
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
        # farmingPositions(where: { userAddress: $userAddress }) {
        #   id
        #   stakedTokenBalance
        # }
      }
    }
  }
`;
