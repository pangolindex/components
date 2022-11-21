import * as React from 'react';
import { ChevronDown } from 'react-feather';
import { Box } from '../Box';
import CurrencyLogo from '../CurrencyLogo';
import { DoubleCurrencyLogo } from '../DoubleCurrencyLogo';
import { TextInput } from '../TextInput';
import { Aligner, CurrencySelect, StyledTokenName } from './styles';
import { CurrencyInputProps } from './types';

const CurrencyInput = ({
  buttonStyle,
  pair,
  currency,
  isShowTextInput = true,
  onTokenClick,
  ...rest
}: CurrencyInputProps) => {
  const renderCurrency = () => {
    if (pair) {
      return <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />;
    } else if (currency) {
      return <CurrencyLogo currency={currency} size={24} imageSize={48} />;
    } else {
      return null;
    }
  };

  const renderStyletoken = () => {
    if (pair) {
      return (
        <StyledTokenName className="pair-name-container">
          {pair?.token0.symbol}:{pair?.token1.symbol}
        </StyledTokenName>
      );
    } else
      return (
        <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
          {(currency && currency.symbol && currency.symbol.length > 20
            ? currency.symbol.slice(0, 4) +
              '...' +
              currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
            : currency?.symbol) || 'Select Token'}
        </StyledTokenName>
      );
  };
  const addonAfter = () => {
    return (
      <CurrencySelect
        selected={!!currency}
        className="open-currency-select-button"
        onClick={() => {
          onTokenClick && onTokenClick();
        }}
        buttonStyle={buttonStyle}
      >
        <Aligner active={Boolean(currency && currency.symbol)}>
          {renderCurrency()}
          {renderStyletoken()}
          <ChevronDown color={!Boolean(currency && currency.symbol) ? 'black' : undefined} />
        </Aligner>
      </CurrencySelect>
    );
  };
  return <Box>{isShowTextInput ? <TextInput {...(rest as any)} addonAfter={addonAfter()} /> : addonAfter()} </Box>;
};

export default CurrencyInput;
