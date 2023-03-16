import { Currency, Token, WAVAX } from '@pangolindex/sdk';
import _uniqueId from 'lodash/uniqueId';
import React, { useContext, useState } from 'react';
import { ThemeContext } from 'styled-components';
import AnalyticsIcon from 'src/assets/images/analytics.svg';
import { Box, CurrencyLogo, Text, Tooltip } from 'src/components';
import { ANALYTICS_PAGE } from 'src/constants';
import { useChainId } from 'src/hooks';
import { ThemeColorsType } from 'src/theme';
import { AnalyticsLink } from './styled';

export interface StatProps {
  title?: React.ReactNode;
  titlePosition?: 'top' | 'bottom';
  stat?: any;
  titleColor?: ThemeColorsType;
  statColor?: ThemeColorsType;
  titleFontSize?: number | number[];
  statFontSize?: number | number[];
  currency?: Currency;
  statAlign?: 'center' | 'right' | 'left';
  showAnalytics?: boolean;
  toolTipText?: string;
}

const Stat = ({
  title,
  titlePosition,
  stat,
  titleColor,
  titleFontSize,
  statColor,
  statFontSize,
  currency,
  statAlign,
  showAnalytics = false,
  toolTipText,
}: StatProps) => {
  const chainId = useChainId();
  const token = currency instanceof Currency && currency instanceof Token ? currency : WAVAX[chainId];

  const [id] = useState(_uniqueId('stat-tip-'));

  const theme = useContext(ThemeContext);

  function getAlignment() {
    if (statAlign === 'center') {
      return 'center';
    } else if (statAlign === 'right') {
      return 'flex-end';
    } else {
      return 'flex-start';
    }
  }

  return (
    <Box display="flex" flexDirection="column" alignItems={getAlignment()}>
      {titlePosition === 'top' && title && (
        <Box display="flex" flexDirection="row" style={{ gap: '5px' }} alignItems="center">
          <Text color={titleColor || 'text1'} fontSize={titleFontSize || 20}>
            {title}
          </Text>
          {showAnalytics && (
            <AnalyticsLink href={`${ANALYTICS_PAGE}/#/token/${token.address}`} target="_blank">
              <img src={AnalyticsIcon} alt="analytics-icon" />
            </AnalyticsLink>
          )}
        </Box>
      )}

      <Box
        display="flex"
        alignItems="center"
        mt={titlePosition === 'top' ? '8px' : '0px'}
        mb={titlePosition === 'bottom' ? '8px' : '0px'}
      >
        <Text color={statColor || 'text1'} fontSize={statFontSize || 16} data-tip data-for={id}>
          {stat}
        </Text>
        {currency && (
          <Box ml={10} height={24}>
            <CurrencyLogo currency={currency} size={24} imageSize={48} />
          </Box>
        )}
        {toolTipText && (
          <Tooltip id={id} effect="solid" backgroundColor={theme.primary}>
            <Text color="text6" fontSize="12px" fontWeight={500} textAlign="center">
              {toolTipText}
            </Text>
          </Tooltip>
        )}
      </Box>

      {titlePosition === 'bottom' && title && (
        <Text color={titleColor || 'text1'} fontSize={titleFontSize || 16}>
          {title}
        </Text>
      )}
    </Box>
  );
};

export default Stat;
