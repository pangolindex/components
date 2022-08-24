import { Token } from '@pangolindex/sdk';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-feather';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Button, CurrencyLogo, Text } from 'src/components';
import { ANALYTICS_PAGE, TIMEFRAME } from 'src/constants';
import { useChainId } from 'src/hooks';
import { useCoinGeckoTokenPrice, useCoinGeckoTokenPriceChart } from 'src/hooks/Tokens';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice';
import { Field } from 'src/state/pswap/actions';
import { useSwapActionHandlers } from 'src/state/pswap/hooks';
import { useTokenPriceData } from 'src/state/ptoken/hooks';
import { formattedNum, toNiceDateYear } from 'src/utils/charts';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { DurationBtns, SelectedCoinInfo, TrackIcons } from './styleds';

type Props = {
  coin: Token;
  visibleTradeButton?: boolean | undefined;
  tradeLinkUrl?: string | undefined;
  redirect?: boolean | undefined;
};

const CoinChart: React.FC<Props> = ({ coin, visibleTradeButton, tradeLinkUrl, redirect }) => {
  const chainId = useChainId();
  const weekFrame = TIMEFRAME.find((value) => value.label === '1W');

  const { tokenUsdPrice } = useCoinGeckoTokenPrice(coin);

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
  const tokenPrice = useUSDCPrice(coin);

  const usdcPrice = tokenUsdPrice || tokenPrice?.toSignificant(4);

  const { onCurrencySelection } = useSwapActionHandlers(chainId);
  const onCurrencySelect = useCallback(
    (currency) => {
      onCurrencySelection(Field.INPUT, currency);
    },
    [onCurrencySelection],
  );

  const pangolinData =
    useTokenPriceData(
      (coin?.address || '').toLowerCase(),
      timeWindow?.momentIdentifier,
      timeWindow?.interval,
      timeWindow?.label,
    ) || [];

  const coinGekoData = useCoinGeckoTokenPriceChart(coin, timeWindow?.days) || [];

  const token = unwrappedToken(coin, chainId);

  const priceChart = coinGekoData.length > 0 ? [...coinGekoData] : [...pangolinData];
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
        <CurrencyLogo currency={token} size={48} />
        <Box>
          <Text color="text1" fontSize="24px" fontWeight={500}>
            {token.symbol}
          </Text>
          <Text color="green1" fontSize="16px">
            ${usdcPrice ? usdcPrice : '-'}
          </Text>
        </Box>
        <TrackIcons>
          <Button
            variant="primary"
            backgroundColor="primary"
            color="black"
            width={'32px'}
            height={'32px'}
            padding="0px"
            href={`${ANALYTICS_PAGE}/#/token/${coin?.address}`}
            target="_blank"
            as="a"
          >
            <Link size={12} />
          </Button>
          {visibleTradeButton &&
            (redirect ? (
              <Button
                variant="plain"
                backgroundColor="oceanBlue"
                color="white"
                padding="0px 10px"
                height="32px"
                href={`/#${tradeLinkUrl}?inputCurrency=${coin?.address}`}
                target=""
                as="a"
              >
                Trade
              </Button>
            ) : (
              <Button
                variant="plain"
                backgroundColor="oceanBlue"
                color="white"
                padding="0px 10px"
                height="32px"
                onClick={() => {
                  onCurrencySelect(coin);
                }}
              >
                Trade
              </Button>
            ))}
        </TrackIcons>
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
            labelStyle={{ paddingTop: 4 }}
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
