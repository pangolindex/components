import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useQuery } from 'react-query';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { hederaFn } from 'src/utils/hedera';
import { SubgraphEnum, useSubgraphClient } from './client';
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
  sumOfEntryTimes: string;
  rewarder: PangochefFarmRewarder;
  // pair can be null in relayer pool case
  pair: PangochefPair | null;
  farmingPositions: {
    stakedTokenBalance: string;
    sumOfEntryTimes: string;
  }[];
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

export interface FarmPosition {
  stakedAmount: string;
  farm: {
    pid: string;
  };
}

export const GET_PANGOCHEF = gql`
  query pangoChefs($where: PangoChef_filter, $userAddress: String!) {
    pangoChefs(where: $where) {
      id
      totalWeight
      rewardRate
      periodFinish
      periodDuration
      totalRewardAdded
      farms(first: 1000) {
        id
        pid
        tvl
        weight
        tokenOrRecipientAddress
        sumOfEntryTimes
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
        farmingPositions(where: { user: $userAddress }) {
          stakedTokenBalance
          sumOfEntryTimes
        }
      }
    }
  }
`;

export const GET_FARMS_STAKED = gql`
  query farmPositions($where: PangoChef_filter, $userAddress: String!) {
    farmingPositions(where: { user: $userAddress }) {
      stakedTokenBalance
      farm {
        pid
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
  const { account } = usePangolinWeb3();
  const gqlClient = useSubgraphClient(SubgraphEnum.Pangochef);
  return useQuery<PangoChefSubgraphInfo[]>(
    ['get-pangochef-subgraph-farms', chainId, account],
    async () => {
      if (!gqlClient) {
        return null;
      }
      const data = await gqlClient.request(GET_PANGOCHEF, {
        userAddress: account ? account.toLowerCase() : '',
      });
      return data?.pangoChefs;
    },
    {
      refetchInterval: 1000 * 60 * 5, // 5 minutes
    },
  );
};

export function useSubgraphFarmsStakedAmount() {
  const chainId = useChainId();
  const { account } = usePangolinWeb3();
  const gqlClient = useSubgraphClient(SubgraphEnum.Pangochef);
  return useQuery<FarmPosition[]>(
    ['get-pangochef-subgraph-farms-staked-amount', chainId, account],
    async () => {
      if (!gqlClient) {
        return undefined;
      }

      const data = await gqlClient.request(GET_FARMS_STAKED, {
        userAddress: account?.toLowerCase() ?? '',
      });

      return data?.farmingPositions;
    },
    {
      refetchInterval: 1000 * 60 * 1, // 1 minutes
      enabled: hederaFn.isHederaChain(chainId) && Boolean(account),
    },
  );
}
