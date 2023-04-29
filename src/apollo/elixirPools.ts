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

export type ElixirPool = {
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
  query pools($poolAddresses: [String]) {
    pools(where: { id_in: $poolAddresses }) {
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
export const useElixirPools = (poolAddresses: (string | undefined)[]) => {
  // we need to convert addresses to lowercase as subgraph has lowercase addresses
  const poolsToFind = poolAddresses?.map((item) => item?.toLowerCase())?.filter((item) => !!item) as string[];

  const chainId = useChainId();
  const gqlClient = useSubgraphClient(SubgraphEnum.ConcentratedLiquidity);
  const validateAddress = validateAddressMapping[chainId];
  // get pairs from subgraph
  return useQuery<ElixirPool[] | null>(['get-subgraph-elixir-pools', chainId, ...poolsToFind], async () => {
    if (!gqlClient) {
      return null;
    }
    const data = await gqlClient.request(GET_ELIXIR_POOLS, { poolAddresses: poolsToFind });

    return (
      (data?.pools as ElixirPool[])
        // convert addresses to checksum address
        ?.map((item) => ({ ...item, id: validateAddress(item.id) as string }))
        // only keep pairs that has id as string
        // because validateAddress returns string if valid address
        // and return false if invalid address, so we want to remove those invalid address tokens
        ?.filter((item) => typeof item.id === 'string')
    );
  });
};
