import { Box, Button, Text } from '@honeycomb/core';
import { CoingeckoWatchListToken, useCoinGeckoTokenPriceChart } from '@honeycomb/state-hooks';
import React, { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TIMEFRAME } from 'src/constants';
import { formattedNum, toNiceDateYear } from 'src/utils';
import { DurationBtns, SelectedCoinInfo } from './styleds';

type Props = {
  coin: CoingeckoWatchListToken;
};

const CoinChart: React.FC<Props> = ({ coin }) => {
  const weekFrame = TIMEFRAME.find((value) => value.label === '1W');

  const [timeWindow, setTimeWindow] = useState(
    weekFrame ||
      ({} as {
        description: string;
        label: string;
        interval: number;
        momentIdentifier: string;
        days: string;
      }),
  );

  const usdcPrice = coin?.price;

  const coinGekoData = useCoinGeckoTokenPriceChart(coin, timeWindow?.days) || [];

  const priceChart = coinGekoData.length > 0 ? [...coinGekoData] : [];
  // add current price in chart
  if (priceChart.length > 0 && usdcPrice) {
    const timestampnow = Math.floor(Date.now() / 1000);

    priceChart.push({
      priceUSD: parseFloat(usdcPrice),
      timestamp: `${timestampnow}`,
    });
  }
  return (
    <Box>
      <SelectedCoinInfo>
        <img src={coin?.imageUrl ? coin?.imageUrl : ''} height={48} width={48} />

        <Box>
          <Text color="text1" fontSize="24px" fontWeight={500}>
            {coin?.symbol}
          </Text>
          <Text color="green1" fontSize="16px">
            ${usdcPrice ? usdcPrice : '-'}
          </Text>
        </Box>
      </SelectedCoinInfo>
      <ResponsiveContainer height={150} width={'100%'}>
        <LineChart data={priceChart}>
          <Line type="monotone" dataKey="priceUSD" stroke={'#18C145'} dot={false} />
          <Tooltip
            cursor={true}
            formatter={(priceUSD: number) => {
              return [`${formattedNum(priceUSD, true)}`, 'USD'];
            }}
            labelFormatter={(_label, data) => {
              return toNiceDateYear(data?.[0]?.payload?.timestamp);
            }}
            labelStyle={{ paddingTop: 4, color: 'black' }}
            wrapperStyle={{ top: -70, left: -10, zIndex: 9999 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <DurationBtns>
        {TIMEFRAME.map((btn) => (
          <Button
            variant="plain"
            key={btn?.label}
            padding="0px"
            width="auto"
            color={timeWindow.label === btn.label ? 'mustardYellow' : 'text1'}
            onClick={() => setTimeWindow(btn)}
          >
            {btn?.label}
          </Button>
        ))}
      </DurationBtns>
    </Box>
  );
};
export default CoinChart;
