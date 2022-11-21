import { Currency, JSBI, Pair, TokenAmount } from '@pangolindex/sdk';
import numeral from 'numeral';
import React from 'react';
import AnalyticsIcon from 'src/assets/images/analytics.svg';
import { Box, Stat, Text } from 'src/components';
import { AnalyticsLink } from 'src/components/Stat/styled';
import { BIG_INT_ZERO } from 'src/constants';
import { useTotalSupply } from 'src/data/TotalSupply';
import { StateContainer } from './styleds';

interface Props {
  title: string;
  totalAmount: string;
  pair: Pair | null;
  pgl?: TokenAmount;
  currency0: Currency | undefined;
  currency1: Currency | undefined;
  link?: string;
}

export default function StatDetail({ title, totalAmount, pair, pgl, currency0, currency1, link }: Props) {
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken);

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!pgl &&
    JSBI.greaterThan(totalPoolTokens.raw, BIG_INT_ZERO) &&
    JSBI.greaterThan(pgl.raw, BIG_INT_ZERO) &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, pgl.raw)
      ? pair.getLiquidityValues(totalPoolTokens, pgl, { feeOn: false })
      : [undefined, undefined];

  return (
    <Box>
      <Text color="text1" fontSize={24} fontWeight={400} style={{ display: 'flex', gap: '1rem' }}>
        {title}
        {link && (
          <AnalyticsLink href={link} target="_blank">
            <img src={AnalyticsIcon} alt="analytics-icon" />
          </AnalyticsLink>
        )}
      </Text>

      <StateContainer>
        <Stat
          title={title}
          stat={totalAmount ?? '-'}
          titlePosition="top"
          titleFontSize={12}
          statFontSize={[20, 16]}
          titleColor="text2"
        />
        {currency0 && (
          <Stat
            title={`Underlying ${currency0?.symbol ? currency0?.symbol : ''}`}
            stat={`${token0Deposited ? numeral(parseFloat(token0Deposited?.toSignificant(6))).format('0.00a') : '-'}`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[20, 16]}
            titleColor="text2"
            currency={currency0}
            showAnalytics={true}
          />
        )}
        {currency1 && (
          <Stat
            title={`Underlying ${currency1?.symbol ? currency1?.symbol : ''}`}
            stat={`${token1Deposited ? numeral(parseFloat(token1Deposited?.toSignificant(6))).format('0.00a') : '-'}`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[20, 16]}
            titleColor="text2"
            currency={currency1}
            showAnalytics={true}
          />
        )}
      </StateContainer>
    </Box>
  );
}
