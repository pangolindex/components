import { ConcentratedTrade, Trade } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { ChevronRight } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, CurrencyLogo, Text } from '../../';
import { SwapRouteWrapper } from './styled';

type Props = {
  trade: Trade | ConcentratedTrade;
};

const SwapRoute: React.FC<Props> = ({ trade }) => {
  const theme = useContext(ThemeContext);
  return (
    <SwapRouteWrapper>
      {trade.route.path.map((token, i, path) => {
        const isLastItem = i === path.length - 1;

        return (
          <Box key={i} display="flex" alignItems="center">
            <Box display="flex" alignItems="center" my={'5px'}>
              <CurrencyLogo currency={token} size={24} />
              <Box ml={'10px'}>
                <Text fontSize={14} color={'swapWidget.primary'}>
                  {token.symbol}
                </Text>
              </Box>
            </Box>
            {isLastItem ? null : <ChevronRight color={theme.swapWidget?.interactiveColor} />}
          </Box>
        );
      })}
    </SwapRouteWrapper>
  );
};

export default SwapRoute;
