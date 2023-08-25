import { FeeAmount } from '@pangolindex/sdk';
import { ReactNode } from 'react';

export type PriceInputProps = {
  value: string;
  onUserInput: (value: string) => void;
  decrement: () => string;
  increment: () => string;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
  feeAmount?: FeeAmount;
  label?: string;
  width?: string;
  locked?: boolean; // disable input
  title: ReactNode;
  tokenA: string | undefined;
  tokenB: string | undefined;
};
