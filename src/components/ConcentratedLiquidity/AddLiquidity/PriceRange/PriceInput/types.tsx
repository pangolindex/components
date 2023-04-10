import { Currency } from '@pangolindex/sdk';

export type PriceInputProps = {
  title: string;
  price: string;
  setPrice: (price: string) => void;
  currency0: Currency;
  currency1: Currency;
};
