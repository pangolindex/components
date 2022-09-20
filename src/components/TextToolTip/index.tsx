import { Currency } from '@pangolindex/sdk';
import React from 'react';
import { PositionProps, SpaceProps, TypographyProps } from 'styled-system';
import { ThemeColorsType } from 'src/theme';
import CurrencyLogo from '../CurrencyLogo';
import { StyledText } from './styles';

interface TextProps {
  text: string;
  toolTipText: string;
  currency?: Currency;
  color?: ThemeColorsType;
  cursor?: string;
}

type Props = TextProps & TypographyProps & SpaceProps & PositionProps;

export default function ToolTipText({ text, toolTipText, currency, ...rest }: Props) {
  return (
    <StyledText {...rest}>
      {text}
      {currency && <CurrencyLogo currency={currency} style={{ marginLeft: '5px' }} />}
      <span className="tooltip">{toolTipText}</span>
    </StyledText>
  );
}
