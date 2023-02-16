import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useQuery } from 'react-query';
import { useChainId } from 'src/hooks';
import { subgraphClient } from './client';
import { SubgraphToken } from './tokens';

export interface PangoChefSubgraphInfo {
  id: string;
  totalWeight: string;
  rewardRate: string;
  periodFinish: string;
  periodDuration: string;
  totalRewardAdded: string;
  farms: PangoChefFarm[];
}

export interface PangoChefFarm {
  id: string;
  pid: string;
  tvl: string;
  weight: string;
  tokenOrRecipientAddress: string;
  rewarder: PangochefFarmRewarder;
  pair: PangochefPair;
}

export interface PangochefFarmRewarder {
  id: string;
  rewards: PangochefFarmReward[];
}

export interface PangochefFarmReward {
  id: string;
  token: SubgraphToken;
  multiplier: string;
}

export interface PangochefPair {
  id: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  token0: SubgraphToken;
  token1: SubgraphToken;
}

export const GET_PANGOCHEF = gql`
  query pangoChefs($where: PangoChef_filter) {
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
            multiplier
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
      }
    }
  }
`;

/**
 * this hook is useful to get information for pangochef famrs  from subgraph
 * @param
 * @returns list farms
 */
export const useSubgraphFarms = () => {
  const chainId = useChainId();

  return useQuery<PangoChefSubgraphInfo[]>(
    ['get-pangochef-subgraph-farms', chainId],
    async () => {
      const gqlClient = subgraphClient[chainId];
      if (!gqlClient) {
        return null;
      }
      const data = await gqlClient.request(GET_PANGOCHEF);
      return data?.pangoChefs;
    },
    {
      refetchInterval: 1000 * 60 * 5, // 5 minutes
    },
  );
};
