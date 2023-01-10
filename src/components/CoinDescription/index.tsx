import { Currency, Token } from '@pangolindex/sdk';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { Box, Text } from 'src/components';
import { useCoinGeckoTokenData } from 'src/hooks/Tokens';
import { ExternalLink } from 'src/theme';

interface Props {
  coin: Token | Currency;
}

export default function CoinDescription({ coin }: Props) {
  const { data } = useCoinGeckoTokenData(coin);

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
            Visit Website
          </Text>
        </ExternalLink>
      </Box>
    </Box>
  );
}
