import React, { useContext, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { ThemeContext } from 'styled-components';
import { Box, Text } from 'src/components';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { CoingeckoWatchListToken } from 'src/state/pcoingecko/hooks';
import { useRemoveCurrencyFromWatchlist } from 'src/state/pwatchlists/atom';
import { DeleteButton, RowWrapper } from './styleds';

type Props = {
  coin: CoingeckoWatchListToken;
  onClick: () => void;
  isSelected: boolean;
  totalLength: number;
};

const WatchlistRow: React.FC<Props> = ({ coin, onClick, isSelected, totalLength }) => {
  const [showChart, setShowChart] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const theme = useContext(ThemeContext);
  const removeCurrency = useRemoveCurrencyFromWatchlist();

  const usdcPrice = coin?.price;

  const chartData = coin?.weeklyChartData?.length > 0 ? coin?.weeklyChartData : [];

  const currentUSDPrice = chartData?.[(chartData || []).length - 1]?.priceUSD || 0;
  const previousUSDPrice = chartData?.[0]?.priceUSD || 0;
  const diffPercent = currentUSDPrice - previousUSDPrice < 0 ? -1 : 1;
  const decreaseValue = currentUSDPrice - previousUSDPrice;
  const perc = (decreaseValue / previousUSDPrice) * 100;

  const mixpanel = useMixpanel();
  const removeToken = () => {
    removeCurrency(coin?.id);
    mixpanel.track(MixPanelEvents.REMOVE_WATCHLIST, {
      token: coin?.symbol,
      tokenAddress: coin?.id,
    });
  };

  useEffect(() => {
    if (usdcPrice) {
      setTimeout(() => {
        // show chart only after price of token comes to display chart in visible space
        setShowChart(true);
      });
    }
  }, [usdcPrice, setShowChart]);

  return (
    <RowWrapper
      isSelected={isSelected}
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <Box display="flex" alignItems="center" height={'100%'} onClick={onClick}>
        <img src={coin?.imageUrl ? coin?.imageUrl : ''} height={24} width={24} />

        <Text color="text1" fontSize={20} fontWeight={500} marginLeft={'6px'}>
          {coin?.symbol}
        </Text>
      </Box>
      <Box px="7px" display="flex" alignItems="center" height={'100%'} onClick={onClick}>
        {/* show chart only after price of token comes to display chart in visible space */}
        {/* rechart has responsive container in mobile view when add 3rd row its gradually increase width so if we set width 99% then its resolved */}
        {/* ref: https://github.com/recharts/recharts/issues/172#issuecomment-307858843 */}
        {showChart && (
          <ResponsiveContainer width={'99%'}>
            <LineChart
              data={chartData}
              margin={{ top: 23 }} // this margin is to keep chart in center
            >
              <Line
                type="monotone"
                dataKey="priceUSD"
                stroke={diffPercent >= 0 ? theme.green1 : theme.red1}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
      <Box textAlign="right" minWidth={30} height={'100%'}>
        {!isSelected && showDeleteButton && totalLength > 1 && (
          <Box zIndex={2} position="relative">
            <DeleteButton onClick={removeToken}>
              <X fontSize={16} fontWeight={600} style={{ float: 'right' }} />
            </DeleteButton>
          </Box>
        )}
        <Box display="flex" flexDirection="column" justifyContent="center" height="100%" onClick={onClick}>
          <Text color="text1" fontSize={14} fontWeight={500}>
            {usdcPrice ? `$${usdcPrice}` : '-'}
          </Text>
          {!isNaN(perc) && (
            <Text color={diffPercent > 0 ? 'green1' : 'red1'} fontSize={'8px'} fontWeight={500}>
              {perc.toFixed(3)}%
            </Text>
          )}
        </Box>
      </Box>
    </RowWrapper>
  );
};

export default WatchlistRow;
