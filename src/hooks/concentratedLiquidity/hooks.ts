import {
  BigintIsh,
  CHAINS,
  ChainId,
  ConcentratedPool,
  Currency,
  JSBI,
  Token,
  computePoolAddress,
} from '@pangolindex/sdk';
import { useMemo } from 'react';
import { FeeAmount } from 'src/components/LiquidityChartRangeInput/types';
import { CONCENTRATE_POOL_STATE_INTERFACE } from 'src/constants/abis/concentratedPool';
import { useChainId } from 'src/hooks';
import { useMultipleContractSingleData } from 'src/state/pmulticall/hooks';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

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
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  );

  return usePools(poolKeys)[0];
}
