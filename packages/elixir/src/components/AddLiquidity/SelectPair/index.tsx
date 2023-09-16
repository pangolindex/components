import { Box, CurrencyLogo, Text } from '@honeycomb-finance/core';
import { useTranslation } from '@honeycomb-finance/shared';
import { Currency } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { ChevronDown, RefreshCcw } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Field } from 'src/state/mint/atom';
import { ArrowWrapper, Currencies, CurrencySelectWrapper } from './styles';
import { SelectPairProps } from './types';

const SelectPair: React.FC<SelectPairProps> = (props) => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const { currency0, currency1, onTokenClick, handleToggle } = props;

  function renderCurrency(currency: Currency | undefined) {
    if (!currency) {
      return (
        <Text color="text1" fontSize={[14, 16]} fontWeight={500} lineHeight="40px">
          {t('swapPage.selectToken')}
        </Text>
      );
    }

    return (
      <>
        <CurrencyLogo size={24} currency={currency} imageSize={48} />
        <Text color="text2" fontSize={[14, 16]} fontWeight={500} lineHeight="40px" marginLeft={10}>
          {currency?.symbol}
        </Text>
      </>
    );
  }
  return (
    <Box>
      <Box display={'flex'} justifyContent={'space-between'}>
        <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
          {t('elixir.selectPair.title')}
        </Text>

        {currency0 && currency1 && (
          <Box textAlign="center" alignItems="center" display="flex" justifyContent={'center'}>
            <ArrowWrapper onClick={handleToggle}>
              <RefreshCcw size="16" color={theme.swapWidget?.interactiveColor} />
            </ArrowWrapper>
          </Box>
        )}
      </Box>

      <Currencies>
        <CurrencySelectWrapper
          onClick={() => {
            onTokenClick(Field.CURRENCY_A);
          }}
        >
          <Box display="flex" alignItems="center">
            {renderCurrency(currency0)}
          </Box>
          <ChevronDown size="16" color={theme.text1} />
        </CurrencySelectWrapper>

        <CurrencySelectWrapper
          onClick={() => {
            onTokenClick(Field.CURRENCY_B);
          }}
        >
          <Box display="flex" alignItems="center">
            {renderCurrency(currency1)}
          </Box>
          <ChevronDown size="16" color={theme.text1} />
        </CurrencySelectWrapper>
      </Currencies>
    </Box>
  );
};

export default SelectPair;
