import { Currency } from '@pangolindex/sdk';

export type PriceInputProps = {
  title: string;
  price: string;
  setPrice: (price: string) => void;
  currency0: Currency | undefined;
  currency1: Currency | undefined;
};
