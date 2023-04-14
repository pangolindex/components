import {
  CHAINS,
  ConcentratedPool,
  Currency,
  FeeAmount,
  JSBI,
  TICK_SPACINGS,
  nearestUsableTick,
  tickToPrice,
} from '@pangolindex/sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TickData, Ticks, useAllV3TicksQuery } from 'src/apollo/allTicks';
import { ChartEntry } from 'src/components/LiquidityChartRangeInput/types';
import { ZERO_ADDRESS } from 'src/constants';
import { useChainId } from 'src/hooks';
import { useTickLensContract } from 'src/hooks/useContract';
import { useSingleContractMultipleData } from 'src/state/pmulticall/hooks';
import computeSurroundingTicks from 'src/utils/computeSurroundingTicks';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import { usePool } from '../hooks/evm';
import { PoolState } from '../hooks/types';
import { TickProcessed } from './types';

export function useDensityChartData({
  currencyA,
  currencyB,
  feeAmount,
}: {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  feeAmount: FeeAmount | undefined;
}) {
  const { isLoading, error, data } = usePoolActiveLiquidity(currencyA, currencyB, feeAmount);

  const formatData = useCallback(() => {
    if (!data?.length) {
      return undefined;
    }

    const newData: ChartEntry[] = [];

    for (let i = 0; i < data.length; i++) {
      const t: TickProcessed = data[i];

      const chartEntry = {
        activeLiquidity: parseFloat(t.liquidityActive.toString()),
        price0: parseFloat(t.price0),
      };

      if (chartEntry.activeLiquidity > 0) {
        newData.push(chartEntry);
      }
    }

    return newData;
  }, [data]);

  return useMemo(() => {
    return {
      isLoading,
      error,
      formattedData: !isLoading ? formatData() : undefined,
    };
  }, [isLoading, error, formatData]);
}

const PRICE_FIXED_DIGITS = 8;

const REFRESH_FREQUENCY = { blocksPerFetch: 2 };

const getActiveTick = (tickCurrent: number | undefined, feeAmount: FeeAmount | undefined) =>
  tickCurrent !== undefined && feeAmount
    ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount]
    : undefined;

const bitmapIndex = (tick: number, tickSpacing: number) => {
  return Math.floor(tick / tickSpacing / 256);
};

function useTicksFromTickLens(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  numSurroundingTicks: number | undefined = 125,
) {
  const [tickDataLatestSynced, setTickDataLatestSynced] = useState<TickData[]>([]);

  const [poolState, pool] = usePool(currencyA, currencyB, feeAmount);

  const tickSpacing = feeAmount && TICK_SPACINGS[feeAmount];

  // Find nearest valid tick for pool in case tick is not initialized.
  const activeTick = pool?.tickCurrent && tickSpacing ? nearestUsableTick(pool?.tickCurrent, tickSpacing) : undefined;

  const chainId = useChainId();

  const tokenA = wrappedCurrency(currencyA, chainId);
  const tokenB = wrappedCurrency(currencyB, chainId);

  const poolAddress =
    tokenA && tokenB && feeAmount && poolState === PoolState.EXISTS
      ? ConcentratedPool.getAddress(
          tokenA,
          tokenB,
          feeAmount,
          undefined,
          chainId ? CHAINS[chainId].contracts?.concentratedLiquidity?.factory : undefined,
        )
      : undefined;

  // it is also possible to grab all tick data but it is extremely slow
  // bitmapIndex(nearestUsableTick(TickMath.MIN_TICK, tickSpacing), tickSpacing)
  const minIndex = useMemo(
    () =>
      tickSpacing && activeTick ? bitmapIndex(activeTick - numSurroundingTicks * tickSpacing, tickSpacing) : undefined,
    [tickSpacing, activeTick, numSurroundingTicks],
  );

  const maxIndex = useMemo(
    () =>
      tickSpacing && activeTick ? bitmapIndex(activeTick + numSurroundingTicks * tickSpacing, tickSpacing) : undefined,
    [tickSpacing, activeTick, numSurroundingTicks],
  );

  const tickLensArgs: [string, number][] = useMemo(
    () =>
      maxIndex && minIndex && poolAddress && poolAddress !== ZERO_ADDRESS
        ? new Array(maxIndex - minIndex + 1)
            .fill(0)
            .map((_, i) => i + minIndex)
            .map((wordIndex) => [poolAddress, wordIndex])
        : [],
    [minIndex, maxIndex, poolAddress],
  );

  const tickLens = useTickLensContract();
  const callStates = useSingleContractMultipleData(
    tickLensArgs.length > 0 ? tickLens : undefined,
    'getPopulatedTicksInWord',
    tickLensArgs,
    REFRESH_FREQUENCY,
  );

  const isError = useMemo(() => callStates.some(({ error }) => error), [callStates]);
  const isLoading = useMemo(() => callStates.some(({ loading }) => loading), [callStates]);
  const IsSyncing = useMemo(() => callStates.some(({ syncing }) => syncing), [callStates]);
  const isValid = useMemo(() => callStates.some(({ valid }) => valid), [callStates]);

  const tickData: TickData[] = useMemo(
    () =>
      callStates
        .map(({ result }) => result?.populatedTicks)
        .reduce(
          (accumulator, current) => [
            ...accumulator,
            ...(current?.map((tickData: TickData) => {
              return {
                tick: tickData.tick,
                liquidityNet: JSBI.BigInt(tickData.liquidityNet),
              };
            }) ?? []),
          ],
          [],
        ),
    [callStates],
  );

  // reset on input change
  useEffect(() => {
    setTickDataLatestSynced([]);
  }, [currencyA, currencyB, feeAmount]);

  // return the latest synced tickData even if we are still loading the newest data
  useEffect(() => {
    if (!IsSyncing && !isLoading && !isError && isValid) {
      setTickDataLatestSynced(tickData.sort((a, b) => a.tick - b.tick));
    }
  }, [isError, isLoading, IsSyncing, tickData, isValid]);

  return useMemo(
    () => ({ isLoading, IsSyncing, isError, isValid, tickData: tickDataLatestSynced }),
    [isLoading, IsSyncing, isError, isValid, tickDataLatestSynced],
  );
}

function useTicksFromSubgraph(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  skip = 0,
) {
  const chainId = useChainId();

  const tokenA = wrappedCurrency(currencyA, chainId);
  const tokenB = wrappedCurrency(currencyB, chainId);
  const poolAddress =
    tokenA && tokenB && feeAmount
      ? ConcentratedPool.getAddress(
          tokenA,
          tokenB,
          feeAmount,
          undefined,
          chainId ? CHAINS[chainId].contracts?.concentratedLiquidity?.factory : undefined,
        )
      : undefined;

  return useAllV3TicksQuery(poolAddress?.toLowerCase(), skip);
}

const MAX_THE_GRAPH_TICK_FETCH_VALUE = 1000;
// Fetches all ticks for a given pool
function useAllV3Ticks(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): {
  isLoading: boolean;
  error: unknown;
  ticks: TickData[] | undefined;
} {
  const useSubgraph = true;

  const tickLensTickData = useTicksFromTickLens(!useSubgraph ? currencyA : undefined, currencyB, feeAmount);

  const [skipNumber, setSkipNumber] = useState(0);
  const [subgraphTickData, setSubgraphTickData] = useState<Ticks>([]);
  const {
    data,
    error,
    loading: isLoading,
  } = useTicksFromSubgraph(useSubgraph ? currencyA : undefined, currencyB, feeAmount, skipNumber);

  useEffect(() => {
    if (data?.ticks.length) {
      setSubgraphTickData((tickData) => [...tickData, ...data.ticks]);
      if (data.ticks.length === MAX_THE_GRAPH_TICK_FETCH_VALUE) {
        setSkipNumber((skipNumber) => skipNumber + MAX_THE_GRAPH_TICK_FETCH_VALUE);
      }
    }
  }, [data?.ticks]);

  return {
    isLoading: useSubgraph
      ? isLoading || data?.ticks.length === MAX_THE_GRAPH_TICK_FETCH_VALUE
      : tickLensTickData.isLoading,
    error: useSubgraph ? error : tickLensTickData.isError,
    ticks: useSubgraph ? subgraphTickData : tickLensTickData.tickData,
  };
}

export function usePoolActiveLiquidity(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): {
  isLoading: boolean;
  error: any;
  activeTick: number | undefined;
  data: TickProcessed[] | undefined;
} {
  const chainId = useChainId();

  const pool = usePool(currencyA, currencyB, feeAmount);

  // Find nearest valid tick for pool in case tick is not initialized.
  const activeTick = useMemo(() => getActiveTick(pool[1]?.tickCurrent, feeAmount), [pool, feeAmount]);

  const { isLoading, error, ticks } = useAllV3Ticks(currencyA, currencyB, feeAmount);

  return useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      activeTick === undefined ||
      pool[0] !== PoolState.EXISTS ||
      !ticks ||
      ticks.length === 0 ||
      isLoading
    ) {
      return {
        isLoading: isLoading || pool[0] === PoolState.LOADING,
        error,
        activeTick,
        data: undefined,
      };
    }

    const token0 = wrappedCurrency(currencyA, chainId);
    const token1 = wrappedCurrency(currencyB, chainId);

    // find where the active tick would be to partition the array
    // if the active tick is initialized, the pivot will be an element
    // if not, take the previous tick as pivot
    const pivot = ticks.findIndex(({ tick }) => tick > activeTick) - 1;

    if (pivot < 0) {
      // consider setting a local error
      console.error('TickData pivot not found');
      return {
        isLoading,
        error,
        activeTick,
        data: undefined,
      };
    }

    if (!token0 || !token1) {
      return {
        isLoading,
        error,
        activeTick,
        data: undefined,
      };
    }

    const activeTickProcessed: TickProcessed = {
      liquidityActive: JSBI.BigInt(pool[1]?.liquidity ?? 0),
      tick: activeTick,
      liquidityNet: Number(ticks[pivot].tick) === activeTick ? JSBI.BigInt(ticks[pivot].liquidityNet) : JSBI.BigInt(0),
      price0: tickToPrice(token0, token1, activeTick).toFixed(PRICE_FIXED_DIGITS),
    };

    const subsequentTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, true);

    const previousTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, false);

    const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks);

    return {
      isLoading,
      error,
      activeTick,
      data: ticksProcessed,
    };
  }, [currencyA, currencyB, activeTick, pool, ticks, isLoading, error]);
}
