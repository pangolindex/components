import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, CurrencyInput, Text } from 'src/components';
import { Field } from 'src/state/pmint/concentratedLiquidity/atom';
import { Currencies } from './styles';
import { SelectPairProps } from './types';

const SelectPair: React.FC<SelectPairProps> = (props) => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const { currency0, currency1, onChangeTokenDrawerStatus } = props;

  return (
    <Box>
      <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
        {t('concentratedLiquidity.selectPair.title')}
      </Text>
      <Currencies>
        <CurrencyInput
          buttonStyle={{
            backgroundColor: theme.bridge?.primaryBgColor,
            color: theme.bridge?.text,
            padding: '1rem 1.1rem',
            width: '100%',
          }}
          onTokenClick={() => {
            onChangeTokenDrawerStatus && onChangeTokenDrawerStatus(Field.CURRENCY_A);
          }}
          isShowTextInput={false}
          fontSize={24}
          currency={currency0}
          id="swap-currency-input-0"
        />
        <CurrencyInput
          buttonStyle={{
            backgroundColor: theme.bridge?.primaryBgColor,
            color: theme.bridge?.text,
            padding: '1rem 1.1rem',
            width: '100%',
          }}
          onTokenClick={() => {
            onChangeTokenDrawerStatus && onChangeTokenDrawerStatus(Field.CURRENCY_B);
          }}
          isShowTextInput={false}
          fontSize={24}
          currency={currency1}
          id="swap-currency-input-1"
        />
      </Currencies>
    </Box>
  );
};

export default SelectPair;
