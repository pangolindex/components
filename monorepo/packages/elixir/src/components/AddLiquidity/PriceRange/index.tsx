import { Box, Text, Tooltip } from '@pangolindex/core';
import { useChainId, useTranslation, wrappedCurrency } from '@pangolindex/shared';
import React, { useContext } from 'react';
import { Code, Info } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Bound } from 'src/state/mint/atom';
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
    onClickFullRange,
    currencyA,
    currencyB,
    feeAmount,
    ticksAtLimit,
  } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);
  const chainId = useChainId();

  const tokenA = currencyA ? wrappedCurrency(currencyA, chainId) : undefined;
  const tokenB = currencyB ? wrappedCurrency(currencyB, chainId) : undefined;

  const isSorted = tokenA && tokenB && !tokenA.equals(tokenB) && tokenA.sortsBefore(tokenB);

  const leftPrice = isSorted ? priceLower : priceUpper?.invert();
  const rightPrice = isSorted ? priceUpper : priceLower?.invert();

  return (
    <Box>
      <Tooltip id="setPriceRange" effect="solid">
        {t('elixir.priceRange.infoContext')}
      </Tooltip>

      <Tooltip id="onClickFullRange" effect="solid">
        {t('elixir.priceRange.fullRangeContext')}
      </Tooltip>

      <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
        <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
          {t('elixir.priceRange.title')}
        </Text>
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          alignItems={'center'}
          style={{ gap: '5px' }}
        >
          <Info size={16} color={theme.white} data-tip data-for="setPriceRange" />
          <Code
            style={{ cursor: 'pointer' }}
            size={16}
            color={theme.white}
            data-tip
            data-for="onClickFullRange"
            onClick={onClickFullRange}
          />
        </Box>
      </Box>

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
          title={t('elixir.priceRange.minPrice')}
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
          title={t('elixir.priceRange.maxPrice')}
          tokenA={currencyA?.symbol}
          tokenB={currencyB?.symbol}
        />
      </PriceInputs>
    </Box>
  );
};

export default PriceRange;
