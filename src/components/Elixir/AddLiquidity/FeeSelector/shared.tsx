import { FeeAmount } from '@pangolindex/sdk';
import type { ReactNode } from 'react';

export const FEE_AMOUNT_DETAIL: Record<FeeAmount, { label: string; description: ReactNode }> = {
  [FeeAmount.LOWEST]: {
    label: '0.01',
    description: 'Best for very stable pairs.',
  },
  [FeeAmount.LOW]: {
    label: '0.05',
    description: 'Best for stable pairs.',
  },
  [FeeAmount.MEDIUM]: {
    label: '0.3',
    description: 'Best for most pairs.',
  },
  [FeeAmount.HIGH]: {
    label: '1',
    description: 'Best for exotic pairs.',
  },
};
