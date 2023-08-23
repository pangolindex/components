import { Box, Text } from '@pangolindex/core';
import { Currency, Token } from '@pangolindex/sdk';
import { ExternalLink, useTranslation } from '@pangolindex/shared';
import { useCoinGeckoTokenData } from '@pangolindex/state-hooks';
import React from 'react';

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
        {data?.description}
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
