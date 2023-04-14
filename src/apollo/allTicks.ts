import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { SubgraphEnum, useSubgraphClient } from './client';

// sample data
// "tick": "206580",
// "liquidityNet": "0",
// "price0": "935851313.6214268205124072798753262",
// "price1": "0.000000001068545810050038338396550374388619",

export type TickData = {
  tick: number;
  liquidityNet: number;
  price0: string;
  price1: string;
};

export type TicksData = {
  ticks: Array<TickData>;
};

export type Ticks = Array<TickData>;

// export type Ticks = AllV3TicksQuery['ticks'];
//export type TickData = Ticks[number];

export const GET_ALL_TICKS = gql`
  query AllV3Ticks($poolAddress: String, $skip: Int!) {
    ticks(first: 1000, skip: $skip, where: { poolAddress: $poolAddress }, orderBy: tickIdx) {
      tick: tickIdx
      liquidityNet
      price0
      price1
    }
  }
`;

export function useAllV3TicksQuery(
  poolAddress: string | undefined,
  skip: number,
): { error: any | undefined; loading: boolean; data: TicksData } {
  const gqlClient = useSubgraphClient(SubgraphEnum.ConcentratedLiquidity);

  const { data, isLoading, error } = useQuery<any>(
    ['get-all-v3-ticks', poolAddress],
    async () => {
      if (!gqlClient) {
        return undefined;
      }

      return await gqlClient.request(GET_ALL_TICKS, { poolAddress: poolAddress?.toLowerCase(), skip });
    },

    {
      enabled: !!poolAddress,
      refetchInterval: 3000, // 1 minutes
    },
  );

  return useMemo(
    () => ({
      error,
      loading: isLoading,
      data,
    }),
    [data, error, isLoading],
  );
}
