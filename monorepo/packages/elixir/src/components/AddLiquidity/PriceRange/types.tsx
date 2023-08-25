import { Currency, Price } from '@pangolindex/sdk';
import { Bound } from 'src/state/mint/atom';

export type PriceRangeProps = {
  priceLower?: Price;
  priceUpper?: Price;
  getDecrementLower: () => string;
  getIncrementLower: () => string;
  getDecrementUpper: () => string;
  getIncrementUpper: () => string;
  onLeftRangeInput: (typedValue: string) => void;
  onRightRangeInput: (typedValue: string) => void;
  onClickFullRange: () => void;
  currencyA?: Currency | null;
  currencyB?: Currency | null;
  feeAmount?: number;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
};
