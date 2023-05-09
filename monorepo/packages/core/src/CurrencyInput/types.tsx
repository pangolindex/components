import { Currency, Pair } from '@pangolindex/sdk';
import * as React from 'react';
import { ButtonStyleProps } from '../Button/types';
import { TextInputProps } from '../TextInput/types';
export type CurrencyInputProps = TextInputProps & {
  currency?: Currency | null;
  pair?: Pair | null;
  alternativeLogoSrc?: string | null;
  isShowTextInput?: boolean;
  showArrowIcon?: boolean;
  buttonStyle?: ButtonStyleProps;
  onTokenClick?: () => void;
};
