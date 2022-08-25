import { CurrencyAmount, Percent } from '@pangolindex/sdk';
import React, { useContext, useMemo } from 'react';
import { ThemeContext } from 'styled-components';
import { warningSeverity } from 'src/utils/prices';
import { Text } from '../../../Text';

export function FiatValue({
  fiatValue,
  priceImpact,
}: {
  fiatValue: CurrencyAmount | null | undefined;
  priceImpact?: Percent;
}) {
  const theme = useContext(ThemeContext);
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined;
    if (priceImpact.lessThan('0')) return theme.green1;
    const severity = warningSeverity(priceImpact);
    if (severity < 1) return theme.text4;
    if (severity < 3) return theme.yellow1;
    return theme.red1;
  }, [priceImpact, theme.green1, theme.red1, theme.text4, theme.yellow1]);

  return (
    <Text color="drawer" fontSize={14} ml={10} style={{ opacity: fiatValue ? 1 : 0.8 }}>
      {fiatValue ? '~' : ''}${fiatValue ? fiatValue?.toSignificant(6, { groupSeparator: ',' }) : '-'}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}> ({priceImpact.multiply('-1').toSignificant(3)}%)</span>
      ) : null}
    </Text>
  );
}
