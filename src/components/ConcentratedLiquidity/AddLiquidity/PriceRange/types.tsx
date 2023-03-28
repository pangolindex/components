import { Currency } from '@pangolindex/sdk';

export type PriceRangeProps = {
  currency0: Currency | undefined;
  currency1: Currency | undefined;
  handleLeftRangeInput: (price: string) => void;
  handleRightRangeInput: (price: string) => void;
};
