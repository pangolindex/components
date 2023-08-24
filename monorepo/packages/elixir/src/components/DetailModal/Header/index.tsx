import { Box, CloseIcon, DoubleCurrencyLogo, Hidden, Stat, Text, Visible } from '@pangolindex/core';
import { unwrappedToken, useChainId, useTranslation } from '@pangolindex/shared';
import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { HeaderRoot, HeaderWrapper, StatsWrapper } from './styles';
import { HeaderProps } from './types';

const Header: React.FC<HeaderProps> = (props) => {
  const { token0, token1, statItems, onClose } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const chainId = useChainId();
  const currency0 = token0 ? unwrappedToken(token0, chainId) : undefined;
  const currency1 = token1 ? unwrappedToken(token1, chainId) : undefined;

  return (
    <HeaderRoot>
      <HeaderWrapper>
        <Box display="flex" alignItems="center">
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={48} />
          <Text color="text1" fontSize={[28, 24]} fontWeight={700} marginLeft={10}>
            {currency0?.symbol}-{currency1?.symbol}
          </Text>
        </Box>
        <Visible upToSmall={true}>
          <CloseIcon onClick={onClose} color={theme.text3} />
        </Visible>
      </HeaderWrapper>

      <StatsWrapper colNumber={statItems.length + 2}>
        <Box display="inline-block">
          <Text color="text8" fontSize={14}>
            {t('common.poolRewards')}
          </Text>

          <Box display="flex" alignItems="center" mt="8px">
            {currency0 && currency1 && <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />}
          </Box>
        </Box>
        {statItems?.map((item, index) => (
          <Stat
            key={index}
            title={item.title}
            stat={item.stat}
            titlePosition="top"
            titleFontSize={14}
            titleColor="text8"
            statFontSize={[24, 18]}
          />
        ))}
        <Box display="inline-block">
          <Hidden upToSmall={true}>
            <CloseIcon onClick={onClose} color={theme.text1} />
          </Hidden>
        </Box>
      </StatsWrapper>
    </HeaderRoot>
  );
};

export default Header;
