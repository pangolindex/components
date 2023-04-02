import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'src/components';
import PriceGraph from './PriceGraph';
import PriceInput from './PriceInput';
import { PriceInputs } from './styles';
import { PriceRangeProps } from './types';

const PriceRange: React.FC<PriceRangeProps> = (props) => {
  const { currency0, currency1, handleLeftRangeInput, handleRightRangeInput } = props;
  const { t } = useTranslation();
  return (
    <Box>
      <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
        {t('concentratedLiquidity.priceRange.title')}
      </Text>
      <PriceGraph />
      <PriceInputs>
        <PriceInput
          title={'Min'}
          price={'780.4'}
          currency0={currency0}
          currency1={currency1}
          setPrice={(price: string) => {
            console.log(price);
            handleLeftRangeInput(price);
          }}
        />
        <PriceInput
          title={'Max'}
          price={'780.4'}
          currency0={currency0}
          currency1={currency1}
          setPrice={(price: string) => {
            console.log(price);
            handleRightRangeInput(price);
          }}
        />
      </PriceInputs>
    </Box>
  );
};

export default PriceRange;
