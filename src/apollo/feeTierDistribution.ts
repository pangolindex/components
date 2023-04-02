import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { concentrateClient } from './client';
// import { FeeTierDistribution } from './__generated__/types-and-hooks'

export const GET_PANGOCHEF = gql`
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
): { error: any | undefined; isLoading: boolean; data: any } {
  const { data, isLoading, error } = useQuery<any>(
    ['get-fee-tier-distribution'],
    async () => {
      if (!concentrateClient) {
        return undefined;
      }

      return await concentrateClient.request(GET_PANGOCHEF, {
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

  // const {
  //   data,
  //   loading: isLoading,
  //   error,
  // } = useQuery(query, {
  //   variables: {
  //     token0: token0?.toLowerCase(),
  //     token1: token1?.toLowerCase(),
  //   },
  //   pollInterval: interval,
  //   client: apolloClient,
  // })

  // return useMemo(
  //   () => ({
  //     error,
  //     isLoading,
  //     data,
  //   }),
  //   [data, error, isLoading]
  // )
}
