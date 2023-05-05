import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useQuery } from 'react-query';
import { useChainId } from 'src/hooks';
import { SubgraphEnum, useSubgraphClient } from './client';

export interface SubgraphPostion {
  id: string;
  balance: string;
  sumOfEntryTimes: string;
  lastUpdate: string;
  lastDevaluation: string;
}

export interface SubgraphStakingContractInfo {
  balance: string;
  sumOfEntryTimes: string;
  rewardRate: string;
}

const GET_STAKING_POSITIONS = gql`
  query nftPositions($positionsIds: [String]) {
    stakingPositions(where: { id_in: $positionsIds }) {
      id
      balance
      sumOfEntryTimes
      lastUpdate
      lastDevaluation
    }
  }
`;

const GET_STAKING_INFO = gql`
  query contractInfo {
    singleSideStakings(orderDirection: desc) {
      balance
      rewardRate
      sumOfEntryTimes
    }
  }
`;

/**
 * This hook return informations of a position
 * @param positionsIds array of the positions if in hex format (0x1, 0x2, ...)
 */
export function useSubgraphPositions(positionsIds: string[]) {
  const chainId = useChainId();
  const gqlClient = useSubgraphClient(SubgraphEnum.SingleStaking);

  return useQuery<SubgraphPostion[]>(
    ['get-subgraph-staking-position', chainId, positionsIds],
    async () => {
      if (!gqlClient) {
        return null;
      }
      const data = await gqlClient.request(GET_STAKING_POSITIONS, {
        positionsIds: positionsIds,
      });
      return data?.stakingPositions;
    },
    {
      refetchInterval: 1000 * 60 * 1, // 1 minute
    },
  );
}

export function useSubgraphStakingContractInfo() {
  const chainId = useChainId();
  const gqlClient = useSubgraphClient(SubgraphEnum.SingleStaking);

  return useQuery<SubgraphStakingContractInfo>(
    ['get-subgraph-staking-info', chainId],
    async () => {
      if (!gqlClient) {
        return null;
      }
      const data = await gqlClient.request(GET_STAKING_INFO);
      return data?.singleSideStakings?.[0];
    },
    {
      refetchInterval: 1000 * 60 * 1, // 1 minute
    },
  );
}
