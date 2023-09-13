import { Token } from '@pangolindex/sdk';
import deepEqual from 'deep-equal';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CoinDescription, Stat, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { convertCoingeckoTokens } from 'src/state/pcoingecko/hooks';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { Information, StateContainer, Wrapper } from './styles';
import { DetailTabProps } from './types';

const DetailTab: React.FC<DetailTabProps> = (props) => {
  const { vault } = props;
  const { t } = useTranslation();
  const chainId = useChainId();

  const currency0 = vault?.poolTokens?.[0] ? unwrappedToken(vault?.poolTokens?.[0], chainId) : undefined;
  const currency1 = vault?.poolTokens?.[1] ? unwrappedToken(vault?.poolTokens?.[1], chainId) : undefined;

  const totalData = [
    {
      title: 'Total Stake',
      stat: '-',
    },
    {
      title: `Underlying  ${currency0?.symbol}`,
      stat: '-',
      currency: currency0,
    },
    {
      title: `Underlying ${currency1?.symbol}`,
      stat: '-',
      currency: currency1,
    },
  ];

  const userData = [
    {
      title: 'Your Stake',
      stat: '-',
    },
    {
      title: `Underlying ${currency0?.symbol}`,
      stat: '-',
      currency: currency0,
    },
    {
      title: `Underlying ${currency1?.symbol}`,
      stat: '-',
      currency: currency1,
    },
  ];

  const getCoinDescriptions = () => {
    const _tokenA = !(vault?.poolTokens?.[0] instanceof Token)
      ? vault?.poolTokens?.[0]
      : convertCoingeckoTokens(vault?.poolTokens?.[0]);
    const _tokenB = !(vault?.poolTokens?.[1] instanceof Token)
      ? vault?.poolTokens?.[1]
      : convertCoingeckoTokens(vault?.poolTokens?.[1]);

    return (
      <>
        {_tokenA && (
          <Box mt={20}>
            <CoinDescription coin={_tokenA} />
          </Box>
        )}

        {_tokenB && !deepEqual(_tokenA, _tokenB) && (
          <Box mt={20}>
            <CoinDescription coin={_tokenB} />
          </Box>
        )}
      </>
    );
  };

  return (
    <Wrapper>
      <Information>
        <Text fontSize={24} fontWeight={500} color={'text2'} mb={'20px'}>
          {t('common.totalStake')}
        </Text>
        <StateContainer colNumber={totalData.length}>
          {totalData.map((item, index) => (
            <Stat
              key={index}
              title={item.title}
              stat={item.stat}
              titlePosition="top"
              titleFontSize={14}
              titleColor="text8"
              {...(item.currency && { currency: item.currency })}
              statFontSize={[24, 18]}
            />
          ))}
        </StateContainer>
      </Information>
      <Information>
        <Text fontSize={24} fontWeight={500} color={'text2'} mb={'20px'}>
          {t('common.yourStake')}
        </Text>
        <StateContainer colNumber={userData.length}>
          {userData.map((item, index) => (
            <Stat
              key={index}
              title={item.title}
              stat={item.stat}
              titlePosition="top"
              titleFontSize={14}
              titleColor="text8"
              {...(item.currency && { currency: item.currency })}
              statFontSize={[24, 18]}
            />
          ))}
        </StateContainer>
      </Information>
      <Information>{getCoinDescriptions()}</Information>
    </Wrapper>
  );
};

export default DetailTab;
