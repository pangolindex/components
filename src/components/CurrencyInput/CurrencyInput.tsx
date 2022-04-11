import * as React from 'react';
import { ChevronDown } from 'react-feather';
import { Box } from '../Box';
import CurrencyLogo from '../CurrencyLogo';
import { DoubleCurrencyLogo } from '../DoubleCurrencyLogo';
import { TextInput } from '../TextInput';
import { Aligner, CurrencySelect, StyledTokenName } from './styles';
import { CurrencyInputProps } from './types';

const CurrencyInput: React.FC<CurrencyInputProps> = (props) => {
  const { pair, currency, onTokenClick, ...rest } = props;

  const addonAfter = () => {
    return (
      <CurrencySelect
        selected={!!currency}
        className="open-currency-select-button"
        onClick={() => {
          onTokenClick && onTokenClick();
        }}
      >
        <Aligner>
          {pair ? (
            <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
          ) : currency ? (
            <CurrencyLogo currency={currency} size={24} imageSize={48} />
          ) : null}
          {pair ? (
            <StyledTokenName className="pair-name-container">
              {pair?.token0.symbol}:{pair?.token1.symbol}
            </StyledTokenName>
          ) : (
            <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
              {(currency && currency.symbol && currency.symbol.length > 20
                ? currency.symbol.slice(0, 4) +
                  '...' +
                  currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                : currency?.symbol) || 'Select Token'}
            </StyledTokenName>
          )}
          <ChevronDown color={!Boolean(currency && currency.symbol) ? 'black' : undefined} />
        </Aligner>
      </CurrencySelect>
    );
  };
  return (
    <Box>
      <TextInput {...(rest as any)} addonAfter={addonAfter()} />
    </Box>
  );
};

export default CurrencyInput;
