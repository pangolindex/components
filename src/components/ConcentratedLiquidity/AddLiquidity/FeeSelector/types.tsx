import { Currency, FeeAmount } from '@pangolindex/sdk';
import { PoolState, useFeeTierDistribution } from 'src/hooks/concentratedLiquidity/hooks';

export type FeeSelectorProps = {
  disabled?: boolean;
  feeAmount?: FeeAmount;
  handleFeePoolSelect: (feeAmount: FeeAmount) => void;
  currency0?: Currency | undefined;
  currency1?: Currency | undefined;
};

export interface FeeOptionProps {
  feeAmount: FeeAmount;
  active: boolean;
  distributions: ReturnType<typeof useFeeTierDistribution>['distributions'];
  poolState: PoolState;
  onClick: () => void;
}
