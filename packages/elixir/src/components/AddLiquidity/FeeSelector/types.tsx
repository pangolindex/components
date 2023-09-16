import { Currency, FeeAmount } from '@pangolindex/sdk';
import { PoolState } from 'src/hooks/types';

export type FeeSelectorProps = {
  disabled?: boolean;
  feeAmount?: FeeAmount;
  handleFeePoolSelect: (feeAmount: FeeAmount) => void;
  currency0?: Currency;
  currency1?: Currency;
};

export interface FeeOptionProps {
  feeAmount: FeeAmount;
  active: boolean;
  distributions: Record<FeeAmount, number | undefined> | undefined;
  poolState: PoolState;
  onClick: () => void;
}

export interface FeeTierPercentageBadgeProps {
  feeAmount: FeeAmount;
  distributions: Record<FeeAmount, number | undefined> | undefined;
  poolState: PoolState;
}
