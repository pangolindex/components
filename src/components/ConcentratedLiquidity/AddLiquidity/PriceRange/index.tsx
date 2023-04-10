import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { Bound } from 'src/state/pmint/concentratedLiquidity/atom';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import PriceInput from './PriceInput';
import { PriceInputs } from './styles';
import { PriceRangeProps } from './types';

const PriceRange: React.FC<PriceRangeProps> = (props) => {
  const {
    priceLower,
    priceUpper,
    onLeftRangeInput,
    onRightRangeInput,
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    currencyA,
    currencyB,
    feeAmount,
    ticksAtLimit,
  } = props;
  const { t } = useTranslation();

  const chainId = useChainId();

  const tokenA = currencyA ? wrappedCurrency(currencyA, chainId) : undefined;
  const tokenB = currencyB ? wrappedCurrency(currencyB, chainId) : undefined;

  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB);

  const leftPrice = isSorted ? priceLower : priceUpper?.invert();
  const rightPrice = isSorted ? priceUpper : priceLower?.invert();

  return (
    <Box>
      <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
        {t('concentratedLiquidity.priceRange.title')}
      </Text>

      <PriceInputs>
        <PriceInput
          value={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] ? '0' : leftPrice?.toSignificant(5) ?? ''}
          onUserInput={onLeftRangeInput}
          width="48%"
          decrement={isSorted ? getDecrementLower : getIncrementUpper}
          increment={isSorted ? getIncrementLower : getDecrementUpper}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          feeAmount={feeAmount}
          label={leftPrice ? `${currencyB?.symbol}` : '-'}
          title={'Min Price'}
          tokenA={currencyA?.symbol}
          tokenB={currencyB?.symbol}
        />
        <PriceInput
          value={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] ? '∞' : rightPrice?.toSignificant(5) ?? ''}
          onUserInput={onRightRangeInput}
          width="48%"
          decrement={isSorted ? getDecrementUpper : getIncrementLower}
          increment={isSorted ? getIncrementUpper : getDecrementLower}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          feeAmount={feeAmount}
          label={rightPrice ? `${currencyB?.symbol}` : '-'}
          title={'Max Price'}
          tokenA={currencyA?.symbol}
          tokenB={currencyB?.symbol}
        />
      </PriceInputs>
    </Box>
  );
};

export default PriceRange;
