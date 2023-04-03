import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { SubgraphEnum, useSubgraphClient } from './client';

type TokenData = {
  feeTier: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
};

type FeeTierDistribution = {
  asToken0: Array<TokenData>;
  asToken1: Array<TokenData>;

  _meta: {
    block: {
      number: number;
    };
  };
};

export const GET_FEE_TIER_DISTRIBUTION = gql`
  query FeeTierDistribution($token0: String!, $token1: String!) {
    _meta {
      block {
        number
      }
    }
    asToken0: pools(
      orderBy: totalValueLockedToken0
      orderDirection: desc
      where: { token0: $token0, token1: $token1 }
    ) {
      feeTier
      totalValueLockedToken0
      totalValueLockedToken1
    }
    asToken1: pools(
      orderBy: totalValueLockedToken0
      orderDirection: desc
      where: { token0: $token1, token1: $token0 }
    ) {
      feeTier
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }
`;

export function useFeeTierDistributionQuery(
  token0: string | undefined,
  token1: string | undefined,
  interval: number,
): { error: any | undefined; isLoading: boolean; data: FeeTierDistribution } {
  const gqlClient = useSubgraphClient(SubgraphEnum.ConcentratedLiquidity);

  const { data, isLoading, error } = useQuery<any>(
    ['get-fee-tier-distribution'],
    async () => {
      if (!gqlClient) {
        return undefined;
      }

      return await gqlClient.request(GET_FEE_TIER_DISTRIBUTION, {
        token0: token0?.toLowerCase(),
        token1: token1?.toLowerCase(),
      });
    },

    {
      refetchInterval: interval, // 1 minutes
    },
  );

  return useMemo(
    () => ({
      error,
      isLoading,
      data,
    }),
    [data, error, isLoading],
  );
}
