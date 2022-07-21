import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEffect } from 'react';
import { GET_BLOCKS, PRICES_BY_BLOCK } from 'src/apollo/block';
import { blockClient, client } from 'src/apollo/client';
import { GET_TOKEN_DAY_DATAS } from 'src/apollo/tokenDayDatas';
import { AppState, useDispatch, useSelector } from 'src/state';
import { updateTokenPriceChartData, updateTokenWeeklyPriceChartData } from 'src/state/ptoken/actions';
import { splitQuery } from 'src/utils/query';
import { ChartState, WeeklyState } from './reducer';

dayjs.extend(utc);

export function useAllTokenWeeklyPriceChartData(): WeeklyState | undefined {
  return useSelector<AppState['ptoken']['weekly']>((state) => state?.ptoken?.weekly || {});
}

export function useAllTokenPricesChartData(): ChartState | undefined {
  return useSelector<AppState['ptoken']['tokenPrices']>((state) => state?.ptoken?.tokenPrices || {});
}

export function useTokenWeeklyChartData(tokenAddress: string) {
  const data1 = useAllTokenWeeklyPriceChartData();

  const chartData = data1?.[tokenAddress];

  const dispatch = useDispatch();

  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        const data = await getTokenWeeklyChartData(tokenAddress);

        dispatch(updateTokenWeeklyPriceChartData({ address: tokenAddress, chartData: data }));
      }
    }
    checkForChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, tokenAddress]);
  return chartData;
}

const getTokenWeeklyChartData = async (tokenAddress: string) => {
  let data = [] as Array<{ id: string; priceUSD: number; date: string }>;

  try {
    const result = await client.query({
      query: GET_TOKEN_DAY_DATAS,
      variables: {
        token: tokenAddress,
      },
      fetchPolicy: 'cache-first',
    });

    data = result?.data?.tokenDayDatas;
  } catch (e) {
    console.log(e);
  }
  data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  return data;
};

export function useTokenPriceData(tokenAddress: string, timeWindow: string, interval = 3600, type = 'ALL') {
  const data1 = useAllTokenPricesChartData();

  const chartData = data1?.[tokenAddress];

  const dispatch = useDispatch();

  useEffect(() => {
    const currentTime = dayjs?.utc();

    // February 8th 2021 - Pangolin Factory is created
    const startTime =
      type === 'ALL'
        ? dayjs('2021-02-11').startOf('hour').unix()
        : currentTime
            .subtract(1, timeWindow as dayjs.ManipulateType)
            .startOf('hour')
            .unix();

    async function fetch() {
      const data = await getIntervalTokenData(tokenAddress, startTime, undefined, interval);

      dispatch(updateTokenPriceChartData({ address: tokenAddress, chartData: data }));
    }

    fetch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, timeWindow, tokenAddress]);

  return chartData;
}

export const getIntervalTokenData = async (
  tokenAddress: string,
  startTime: number,
  to = dayjs.utc().unix(),
  interval = 3600 * 24,
) => {
  const utcEndTime = to;
  let time = startTime;

  // create an array of hour start times until we reach current hour
  // buffer by half hour to catch case where graph isnt synced to latest block

  const timestamps = [] as Array<number>;
  while (time < utcEndTime) {
    timestamps.push(time);
    time += interval;
  }

  // backout if invalid timestamp format
  if (timestamps.length === 0) {
    return [];
  }

  // once you have all the timestamps, get the blocks for each timestamp in a bulk query
  let blocks;
  try {
    blocks = await getBlocksFromTimestamps(timestamps, 100);

    // catch failing case
    if (!blocks || blocks.length === 0) {
      return [];
    }

    const result: any = await splitQuery(PRICES_BY_BLOCK, client, [tokenAddress], blocks, 50);

    // format token ETH price results
    const values = [] as Array<{ timestamp: string; derivedETH: number; ethPrice: number; priceUSD: any }>;
    for (const row in result) {
      const timestamp = row.split('t')[1];
      if (!timestamp) continue;

      const derivedETH = parseFloat(result[`t${timestamp}`]?.derivedETH);
      const ethPrice = parseFloat(result[`b${timestamp}`]?.ethPrice);
      const priceUSD = ethPrice * derivedETH;

      values.push({
        timestamp,
        derivedETH,
        ethPrice,
        priceUSD,
      });
    }

    const formattedHistory = [] as Array<{ timestamp: string; priceUSD: number }>;

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        priceUSD: parseFloat(values?.[i].priceUSD),
      });
    }

    return formattedHistory;
  } catch (e) {
    console.log(e);
    console.log('error fetching blocks');
    return [];
  }
};

export interface Category {
  timestamp?: string;
  number?: any;
}

export async function getBlocksFromTimestamps(timestamps: Array<number>, skipCount = 500) {
  if (timestamps?.length === 0) {
    return [];
  }
  const fetchedData: any = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount);
  const blocks: Category[] = [];
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number'],
        });
      }
    }
  }

  return blocks;
}
