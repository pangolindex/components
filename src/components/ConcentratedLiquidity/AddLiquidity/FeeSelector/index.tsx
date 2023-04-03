import { FeeAmount } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Text } from 'src/components';
import { PoolState, useFeeTierDistribution, usePools } from 'src/hooks/concentratedLiquidity/hooks';
import usePrevious from 'src/hooks/usePrevious';
import FeeOption from './FeeOption';
import { FeeTierPercentageBadge } from './FeeTierPercentageBadge';
import { FEE_AMOUNT_DETAIL } from './shared';
import {
  DynamicSection,
  FeeSelectorWrapper,
  FeeTiers,
  FocusedOutlineCard,
  RowBetween,
  SelectFeeTierWrapper,
} from './styles';
import { FeeSelectorProps } from './types';

const FeeSelector: React.FC<FeeSelectorProps> = (props) => {
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

  const [showOptions, setShowOptions] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  const previousFeeAmount = usePrevious(feeAmount);

  const handleFeePoolSelectWithEvent = useCallback(
    (fee: FeeAmount) => {
      handleFeePoolSelect(fee);
    },
    [handleFeePoolSelect],
  );

  useEffect(() => {
    if (feeAmount || isLoading || isError) {
      return;
    }

    if (!largestUsageFeeTier) {
      // cannot recommend, open options
      setShowOptions(true);
    } else {
      setShowOptions(false);

      handleFeePoolSelect(largestUsageFeeTier);
    }
  }, [feeAmount, isLoading, isError, largestUsageFeeTier, handleFeePoolSelect]);

  useEffect(() => {
    setShowOptions(isError);
  }, [isError]);

  useEffect(() => {
    if (feeAmount && previousFeeAmount !== feeAmount) {
      setPulsing(true);
    }
  }, [previousFeeAmount, feeAmount]);

  return (
    <FeeSelectorWrapper>
      <DynamicSection disabled={disabled}>
        <FocusedOutlineCard pulsing={pulsing} onAnimationEnd={() => setPulsing(false)}>
          <RowBetween>
            <SelectFeeTierWrapper>
              {!feeAmount ? (
                <>
                  <Text color="text1" fontSize={24} fontWeight={500}>
                    Fee tier
                  </Text>

                  <Text fontWeight={400} fontSize="12px" textAlign="left">
                    The % you will earn in fees.
                  </Text>
                </>
              ) : (
                <>
                  <Text>{FEE_AMOUNT_DETAIL[feeAmount].label}% fee tier</Text>

                  <Box style={{ width: 'fit-content', marginTop: '8px' }}>
                    {distributions && (
                      <FeeTierPercentageBadge
                        distributions={distributions}
                        feeAmount={feeAmount}
                        poolState={poolsByFeeTier[feeAmount]}
                      />
                    )}
                  </Box>
                </>
              )}
            </SelectFeeTierWrapper>

            <Button
              variant="plain"
              backgroundColor="color2"
              color="text1"
              height="30px"
              width={'40px'}
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? 'Hide' : 'Edit'}
            </Button>
          </RowBetween>
        </FocusedOutlineCard>

        {showOptions && (
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
            })}
          </FeeTiers>
        )}
      </DynamicSection>
    </FeeSelectorWrapper>
  );
};

export default FeeSelector;
