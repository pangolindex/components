import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
import { useQuery } from 'react-query';
import { useChainId } from 'src/hooks';
import { validateAddressMapping } from 'src/utils';
import { SubgraphEnum, useSubgraphClient } from './client';

export type ElixirTick = {
  id: string;
  tickIdx: string;
  liquidityGross: string;
  liquidityNet: string;
};

export type ElixirPoolType = {
  id: string;
  token0: {
    id: string;
    decimals: string;
    symbol: string;
    name: string;
  };
  token1: {
    id: string;
    decimals: string;
    symbol: string;
    name: string;
  };
  feeTier: string;
  sqrtPrice: string;
  liquidity: string;
  tick: string;
  ticks: ElixirTick[];
};

export const GET_ELIXIR_POOLS = gql`
  query pools($where: Pool_filter, $first: Int) {
    pools(first: $first, orderBy: liquidity, orderDirection: desc, where: $where) {
      id
      token0 {
        id
        decimals
        symbol
        name
      }
      token1 {
        id
        decimals
        symbol
        name
      }
      feeTier
      sqrtPrice
      liquidity
      tick
      ticks {
        id
        tickIdx
        liquidityGross
        liquidityNet
      }
    }
  }
`;

/**
 * this hook is useful to find information of given elixir pool addresses from subgraph
 * @param poolAddresses array of pool address
 * @returns list of elixir pools
 */
export const useElixirPools = (poolAddresses?: (string | undefined)[]) => {
  let poolsToFind: string[] | undefined = undefined;
  // we need to convert addresses to lowercase as subgraph has lowercase addresses
  poolsToFind =
    poolAddresses && (poolAddresses?.map((item) => item?.toLowerCase())?.filter((item) => !!item) as string[]);

  const chainId = useChainId();
  const gqlClient = useSubgraphClient(SubgraphEnum.Elixir);
  const validateAddress = validateAddressMapping[chainId];

  // get pairs from subgraph
  return useQuery<ElixirPoolType[] | null>(['get-subgraph-elixir-pools', chainId], async () => {
    if (!gqlClient) {
      return null;
    }
    const data = await gqlClient.request(GET_ELIXIR_POOLS, {
      where: poolsToFind ? { id_in: poolsToFind } : {},
      first: poolsToFind ? undefined : 10,
    });

    return (
      (data?.pools as ElixirPoolType[])
        // convert addresses to checksum address
        ?.map((item) => ({ ...item, id: validateAddress(item.id) as string }))
        // only keep pairs that has id as string
        // because validateAddress returns string if valid address
        // and return false if invalid address, so we want to remove those invalid address tokens
        ?.filter((item) => typeof item.id === 'string')
    );
  });
};
