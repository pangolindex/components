import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, CurrencyLogo, DoubleCurrencyLogo, Stat, Text } from 'src/components';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { CloseIcon, Hidden, Visible } from 'src/theme/components';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { HeaderRoot, HeaderWrapper, StatsWrapper } from './styles';
import { HeaderProps } from './types';

const Header: React.FC<HeaderProps> = (props) => {
  const { token0, token1, statItems, stakeActive, onClose } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const chainId = useChainId();
  const png = PNG[chainId];
  const currency0 = token0 ? unwrappedToken(token0, chainId) : undefined;
  const currency1 = token1 ? unwrappedToken(token1, chainId) : undefined;
  // const [selectedProvider, setSelectedProvider] = useState<string>('');

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
        {stakeActive && (
          <Box display="inline-block">
            <Text color="text8" fontSize={14}>
              {t('common.poolRewards')}
            </Text>

            <Box display="flex" alignItems="center" mt="8px">
              {png && <CurrencyLogo currency={png} size={24} />}
            </Box>
          </Box>
        )}
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
        {/* <DropdownMenu
          placeHolder={'Providers'}
          options={
            providers?.map((x) => {
              return { label: x.name, value: x.name };
            }) || []
          }
          defaultValue={selectedProvider}
          onSelect={(value) => {
            setSelectedProvider(value as string);
          }}
          height="54px"
        /> */}
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
