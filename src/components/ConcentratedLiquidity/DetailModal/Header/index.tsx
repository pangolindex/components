import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, DoubleCurrencyLogo, RewardTokens, Stat, Text } from 'src/components';
import { CloseIcon, Hidden, Visible } from 'src/theme/components';
import { HeaderRoot, HeaderWrapper, StatsWrapper } from './styles';
import { HeaderProps } from './types';

const Header: React.FC<HeaderProps> = (props) => {
  const { token0, token1, statItems, onClose } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  return (
    <HeaderRoot>
      <HeaderWrapper>
        <Box display="flex" alignItems="center">
          <DoubleCurrencyLogo currency0={token0} currency1={token1} size={48} />
          <Text color="text1" fontSize={[28, 24]} fontWeight={700} marginLeft={10}>
            {token0?.symbol}-{token1?.symbol}
          </Text>
        </Box>
        <Visible upToSmall={true}>
          <CloseIcon onClick={onClose} color={theme.text3} />
        </Visible>
      </HeaderWrapper>

      <StatsWrapper colNumber={statItems.length + 1}>
        <Box display="inline-block">
          <Text color="text8" fontSize={14}>
            {t('common.poolRewards')}
          </Text>

          <Box display="flex" alignItems="center" mt="8px">
            {token0 && token1 && (
              <RewardTokens showNativeRewardToken={false} rewardTokens={[token0, token1]} size={24} />
            )}
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
      </StatsWrapper>
      <Hidden upToSmall={true}>
        <CloseIcon onClick={onClose} color={theme.text1} />
      </Hidden>
    </HeaderRoot>
  );
};

export default Header;
