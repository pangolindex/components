import { Box, Text } from '@honeycomb/core';
import { Currency, Token } from '@pangolindex/sdk';
import { ExternalLink, useTranslation } from '@honeycomb/shared';
import { useCoinGeckoTokenData } from '@honeycomb/state-hooks';
import React from 'react';
import sanitizeHtml from 'sanitize-html';

interface Props {
  coin: Token | Currency;
}

export default function CoinDescription({ coin }: Props) {
  const { data } = useCoinGeckoTokenData(coin);
  const { t } = useTranslation();
  if (!data || !data?.description) {
    return null;
  }

  return (
    <Box>
      <Text color="text1" fontSize={16} fontWeight="bold" mb="15px">
        {coin?.name}
      </Text>

      <Text color="text1" fontSize={14}>
        {sanitizeHtml(data?.description, {
          allowedTags: sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'a'),
        })}
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
