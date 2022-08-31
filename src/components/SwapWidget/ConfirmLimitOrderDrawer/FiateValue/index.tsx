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
    if (priceImpact.lessThan('0')) return theme.oceanBlue;
    const severity = warningSeverity(priceImpact);
    if (severity < 1) return theme.color9;
    if (severity < 3) return theme.primary;
    return theme.venetianRed;
  }, [priceImpact, theme.oceanBlue, theme.venetianRed, theme.color9, theme.primary]);

  return (
    <Text fontSize={14} color={fiatValue ? 'swapWidget.primary' : 'swapWidget.secondary'} ml={10}>
      {fiatValue ? '~' : ''}${fiatValue ? fiatValue?.toSignificant(6, { groupSeparator: ',' }) : '-'}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}> ({priceImpact.multiply('-1').toSignificant(3)}%)</span>
      ) : null}
    </Text>
  );
}
