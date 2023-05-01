import { FeeAmount } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { useFeeTierDistributionHook, usePoolsHook } from 'src/hooks/concentratedLiquidity/hooks';
import { PoolState } from 'src/hooks/concentratedLiquidity/hooks/types';
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

  const chainId = useChainId();
  const { t } = useTranslation();
  const usePools = usePoolsHook[chainId];
  const useFeeTierDistribution = useFeeTierDistributionHook[chainId];

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
                  <Text color="text1" fontSize={16} fontWeight={500}>
                    {t('elixir.feeTier.feeTier')}
                  </Text>

                  <Text fontWeight={400} fontSize="12px" textAlign="left">
                    {t('elixir.feeTier.earnFees')}
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
              width={'50px'}
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? `${t('common.hide')}` : `${t('common.edit')}`}
            </Button>
          </RowBetween>
        </FocusedOutlineCard>

        {showOptions && (
          <FeeTiers>
            {[FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH].map((_feeAmount) => {
              return (
                <FeeOption
                  feeAmount={_feeAmount}
                  active={feeAmount === _feeAmount}
                  onClick={() => handleFeePoolSelectWithEvent(_feeAmount)}
                  distributions={distributions}
                  poolState={poolsByFeeTier[_feeAmount]}
                  key={_feeAmount}
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
