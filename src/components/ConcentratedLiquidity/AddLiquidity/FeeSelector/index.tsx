import { FeeAmount } from '@pangolindex/sdk';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PoolState, useFeeTierDistribution, usePools } from 'src/hooks/concentratedLiquidity/hooks';
import FeeOption from './FeeOption';
import { FeeTiers } from './styles';
import { FeeSelectorProps } from './types';

const FeeSelector: React.FC<FeeSelectorProps> = (props) => {
  const { t } = useTranslation();
  const { disabled = false, feeAmount, handleFeePoolSelect, currency0, currency1 } = props;

  const { isLoading, isError, largestUsageFeeTier, distributions } = useFeeTierDistribution(currency0, currency1);

  // get pool data on-chain for latest states
  const pools = usePools([
    [currency0, currency1, FeeAmount.LOWEST],
    [currency0, currency1, FeeAmount.LOW],
    [currency0, currency1, FeeAmount.MEDIUM],
    [currency0, currency1, FeeAmount.HIGH],
  ]);

  const poolsByFeeTier: Record<FeeAmount, PoolState> = useMemo(
    () =>
      pools.reduce(
        (acc, [curPoolState, curPool]) => {
          acc = {
            ...acc,
            ...{ [curPool?.fee as FeeAmount]: curPoolState },
          };
          return acc;
        },
        {
          // default all states to NOT_EXISTS
          [FeeAmount.LOWEST]: PoolState.NOT_EXISTS,
          [FeeAmount.LOW]: PoolState.NOT_EXISTS,
          [FeeAmount.MEDIUM]: PoolState.NOT_EXISTS,
          [FeeAmount.HIGH]: PoolState.NOT_EXISTS,
        },
      ),
    [pools],
  );

  const handleFeePoolSelectWithEvent = useCallback(
    (fee: FeeAmount) => {
      handleFeePoolSelect(fee);
    },
    [handleFeePoolSelect],
  );

  return (
    <FeeTiers>
      {[FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH].map((_feeAmount, i) => {
        return (
          <FeeOption
            feeAmount={_feeAmount}
            active={feeAmount === _feeAmount}
            onClick={() => handleFeePoolSelectWithEvent(_feeAmount)}
            distributions={distributions}
            poolState={poolsByFeeTier[_feeAmount]}
            key={i}
          />
        );

        return null;
      })}
    </FeeTiers>
  );
};

export default FeeSelector;
