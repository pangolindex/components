import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stat, Text } from 'src/components';
import { useChainId } from 'src/hooks';
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
    </Wrapper>
  );
};

export default DetailTab;
