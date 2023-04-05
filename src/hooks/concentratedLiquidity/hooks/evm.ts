import {
  BigintIsh,
  CHAINS,
  ChainId,
  ConcentratedPool,
  Currency,
  FeeAmount,
  JSBI,
  Token,
  computePoolAddress,
} from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useFeeTierDistributionQuery } from 'src/apollo/feeTierDistribution';
import { CONCENTRATE_POOL_STATE_INTERFACE } from 'src/constants/abis/concentratedPool';
import { useChainId } from 'src/hooks';
import { useBlockNumber } from 'src/state/papplication/hooks';
import { useMultipleContractSingleData } from 'src/state/pmulticall/hooks';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import { FeeTierDistribution, PoolState } from './types';
import { usePoolsHook } from './index';

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128;

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: ConcentratedPool[] = [];
  private static addresses: { key: string; address: string }[] = [];

  static getPoolAddress(
    factoryAddress: string,
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    chainId: ChainId,
  ): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2);
    }

    const { address: addressA } = tokenA;
    const { address: addressB } = tokenB;
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`;
    const found = this.addresses.find((address) => address.key === key);
    if (found) return found.address;

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
        chainId,
      }),
    };
    this.addresses.unshift(address);
    return address.address;
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number,
  ): ConcentratedPool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2);
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick,
    );
    if (found) return found;

    const pool = new ConcentratedPool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick);
    this.pools.unshift(pool);
    return pool;
  }
}

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [PoolState, ConcentratedPool | null][] {
  const chainId = useChainId();

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length);

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = wrappedCurrency(currencyA, chainId);
        const tokenB = wrappedCurrency(currencyB, chainId);

        if (!tokenA || !tokenB) return undefined;

        if (tokenA.equals(tokenB)) return undefined;

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount];
      }
      return undefined;
    });
  }, [chainId, poolKeys]);

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && CHAINS[chainId].contracts?.concentratedLiquidity?.factory;
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length);

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value, chainId));
  }, [chainId, poolTokens]);

  const slot0s = useMultipleContractSingleData(poolAddresses, CONCENTRATE_POOL_STATE_INTERFACE, 'slot0');
  const liquidities = useMultipleContractSingleData(poolAddresses, CONCENTRATE_POOL_STATE_INTERFACE, 'liquidity');

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index];
      if (!tokens) return [PoolState.INVALID, null];
      const [token0, token1, fee] = tokens;

      if (!slot0s[index]) return [PoolState.INVALID, null];
      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index];

      if (!liquidities[index]) return [PoolState.INVALID, null];
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index];

      if (!tokens || !slot0Valid || !liquidityValid) return [PoolState.INVALID, null];
      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null];
      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null];
      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null];

      try {
        const pool = PoolCache.getPool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick);
        return [PoolState.EXISTS, pool];
      } catch (error) {
        console.error('Error when constructing the pool', error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [liquidities, poolKeys, slot0s, poolTokens]);
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): [PoolState, ConcentratedPool | null] {
  const chainId = useChainId();
  const usePools = usePoolsHook[chainId];

  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  );

  return usePools(poolKeys)[0];
}

// maximum number of blocks past which we consider the data stale
const MAX_DATA_BLOCK_AGE = 20;

export function useFeeTierDistribution(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): FeeTierDistribution {
  const chainId = useChainId();
  const tokenA = wrappedCurrency(currencyA, chainId);
  const tokenB = wrappedCurrency(currencyB, chainId);

  const { isLoading, error, distributions } = usePoolTVL(tokenA, tokenB);

  // fetch all pool states to determine pool state
  const [poolStateVeryLow] = usePool(currencyA, currencyB, FeeAmount.LOWEST);
  const [poolStateLow] = usePool(currencyA, currencyB, FeeAmount.LOW);
  const [poolStateMedium] = usePool(currencyA, currencyB, FeeAmount.MEDIUM);
  const [poolStateHigh] = usePool(currencyA, currencyB, FeeAmount.HIGH);

  return useMemo(() => {
    if (isLoading || error || !distributions) {
      return {
        isLoading,
        isError: !!error,
        distributions,
      };
    }

    const largestUsageFeeTier = Object.keys(distributions)
      .map((d) => Number(d))
      .filter((d: FeeAmount) => distributions[d] !== 0 && distributions[d] !== undefined)
      .reduce((a: FeeAmount, b: FeeAmount) => ((distributions[a] ?? 0) > (distributions[b] ?? 0) ? a : b), -1);

    const percentages =
      !isLoading &&
      !error &&
      distributions &&
      poolStateVeryLow !== PoolState.LOADING &&
      poolStateLow !== PoolState.LOADING &&
      poolStateMedium !== PoolState.LOADING &&
      poolStateHigh !== PoolState.LOADING
        ? {
            [FeeAmount.LOWEST]:
              poolStateVeryLow === PoolState.EXISTS ? (distributions[FeeAmount.LOWEST] ?? 0) * 100 : undefined,
            [FeeAmount.LOW]: poolStateLow === PoolState.EXISTS ? (distributions[FeeAmount.LOW] ?? 0) * 100 : undefined,
            [FeeAmount.MEDIUM]:
              poolStateMedium === PoolState.EXISTS ? (distributions[FeeAmount.MEDIUM] ?? 0) * 100 : undefined,
            [FeeAmount.HIGH]:
              poolStateHigh === PoolState.EXISTS ? (distributions[FeeAmount.HIGH] ?? 0) * 100 : undefined,
          }
        : undefined;

    return {
      isLoading,
      isError: !!error,
      distributions: percentages,
      largestUsageFeeTier: largestUsageFeeTier === -1 ? undefined : largestUsageFeeTier,
    };
  }, [isLoading, error, distributions, poolStateVeryLow, poolStateLow, poolStateMedium, poolStateHigh]);
}

export function usePoolTVL(token0: Token | undefined, token1: Token | undefined) {
  const latestBlock = useBlockNumber();
  const { isLoading, error, data } = useFeeTierDistributionQuery(token0?.address, token1?.address, 30000);

  const { asToken0, asToken1, _meta } = data ?? {};

  return useMemo(() => {
    if (!latestBlock || !_meta || !asToken0 || !asToken1) {
      return {
        isLoading,
        error,
      };
    }

    if (latestBlock - (_meta?.block?.number ?? 0) > MAX_DATA_BLOCK_AGE) {
      console.log(`Graph stale (latest block: ${latestBlock})`);
      return {
        isLoading,
        error,
      };
    }

    const all = asToken0.concat(asToken1);

    // sum tvl for token0 and token1 by fee tier
    const tvlByFeeTier = all.reduce<{ [feeAmount: number]: [number | undefined, number | undefined] }>(
      (acc, value) => {
        acc[value.feeTier][0] = (acc[value.feeTier][0] ?? 0) + Number(value.totalValueLockedToken0);
        acc[value.feeTier][1] = (acc[value.feeTier][1] ?? 0) + Number(value.totalValueLockedToken1);
        return acc;
      },
      {
        [FeeAmount.LOWEST]: [undefined, undefined],
        [FeeAmount.LOW]: [undefined, undefined],
        [FeeAmount.MEDIUM]: [undefined, undefined],
        [FeeAmount.HIGH]: [undefined, undefined],
      } as Record<FeeAmount, [number | undefined, number | undefined]>,
    );
    // const tvlByFeeTier = {};
    // sum total tvl for token0 and token1
    const [sumToken0Tvl, sumToken1Tvl] = Object.values(tvlByFeeTier).reduce(
      (acc: [number, number], value: any) => {
        acc[0] += value[0] ?? 0;
        acc[1] += value[1] ?? 0;
        return acc;
      },
      [0, 0],
    );

    // returns undefined if both tvl0 and tvl1 are undefined (pool not created)
    const mean = (tvl0: number | undefined, sumTvl0: number, tvl1: number | undefined, sumTvl1: number) =>
      tvl0 === undefined && tvl1 === undefined ? undefined : ((tvl0 ?? 0) + (tvl1 ?? 0)) / (sumTvl0 + sumTvl1) || 0;

    const distributions: Record<FeeAmount, number | undefined> = {
      [FeeAmount.LOWEST]: mean(
        tvlByFeeTier[FeeAmount.LOWEST][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOWEST][1],
        sumToken1Tvl,
      ),
      [FeeAmount.LOW]: mean(tvlByFeeTier[FeeAmount.LOW][0], sumToken0Tvl, tvlByFeeTier[FeeAmount.LOW][1], sumToken1Tvl),
      [FeeAmount.MEDIUM]: mean(
        tvlByFeeTier[FeeAmount.MEDIUM][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.MEDIUM][1],
        sumToken1Tvl,
      ),
      [FeeAmount.HIGH]: mean(
        tvlByFeeTier[FeeAmount.HIGH][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.HIGH][1],
        sumToken1Tvl,
      ),
    };

    return {
      isLoading,
      error,
      distributions,
    };
  }, [_meta, asToken0, asToken1, isLoading, error, latestBlock]);
}
