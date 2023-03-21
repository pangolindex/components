import { Currency } from '@pangolindex/sdk';

export type AddLiquidityProps = {
  isOpen: boolean;
  currency0: Currency;
  currency1: Currency;
  onClose: () => void;
};
