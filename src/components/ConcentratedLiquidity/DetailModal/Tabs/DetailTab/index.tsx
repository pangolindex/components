import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import nft from 'src/assets/images/tmpNFT.svg';
import { Box, Stat, Text } from 'src/components';
import PriceCard from './PriceCard';
import { Information, NFT, PriceCards, PriceDetailAndNft, StateContainer, Wrapper } from './styles';

const DetailTab: React.FC = () => {
  const { t } = useTranslation();
  // ------------------------------ MOCK DATA ----------------------------------
  const currency0 = new Token(ChainId.AVALANCHE, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin');
  const currency1 = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );
  const totalData = [
    {
      title: 'Total Stake',
      stat: '25,43M$',
    },
    {
      title: 'Underlying USDC',
      stat: '25,43K',
      currency: currency0,
    },
    {
      title: 'Underlying PNG',
      stat: '253,4K',
      currency: currency1,
    },
  ];

  const userData = [
    {
      title: 'Your Stake',
      stat: '15.43M$',
    },
    {
      title: 'Underlying USDC',
      stat: '15,2K',
      currency: currency0,
    },
    {
      title: 'Underlying PNG',
      stat: '10,25K',
      currency: currency1,
    },
  ];
  // ---------------------------------------------------------------------------
  return (
    <Wrapper>
      <PriceDetailAndNft>
        <Box display={'flex'}>
          <NFT src={nft} alt={'Icon'} />
        </Box>
        <Box display={'flex'} flexDirection={'column'}>
          <PriceCards>
            <PriceCard
              title={'Min Price'}
              price={'786.87'}
              currencyPair={'USDC/DAI'}
              description={'Your position will be 100% AVAX at this price.'}
            />
            <PriceCard
              title={'Max Price'}
              price={'3128.87'}
              currencyPair={'USDC/DAI'}
              description={'Your position will be 100% PNG at this price.'}
            />
          </PriceCards>
          <Box>
            <PriceCard title={'Current Price'} price={'786.87'} currencyPair={'USDC/DAI'} />
          </Box>
        </Box>
      </PriceDetailAndNft>
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
