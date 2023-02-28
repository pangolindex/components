import { Currency, Token } from '@pangolindex/sdk';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'src/components';
import { useCoinGeckoTokenData } from 'src/state/pcoingecko/hooks';
import { ExternalLink } from 'src/theme';

interface Props {
  coin: Token | Currency;
}

export default function CoinDescription({ coin }: Props) {
  const { data } = useCoinGeckoTokenData(coin);
  const { t } = useTranslation();
  if (!data || !data?.description || !data.homePage) {
    return null;
  }

  return (
    <Box>
      <Text color="text1" fontSize={16} fontWeight="bold" mb="15px">
        {coin?.name}
      </Text>

      <Text color="text1" fontSize={14}>
        {ReactHtmlParser(data?.description.replace('\n', '<br />'))}
      </Text>

      <Box mt="5px">
        <ExternalLink style={{ color: 'white', textDecoration: 'underline' }} href={data.homePage} target="_blank">
          <Text color="text1" fontSize={16} fontWeight={500}>
            {t('pool.visitWebsite')}
          </Text>
        </ExternalLink>
      </Box>
    </Box>
  );
}
