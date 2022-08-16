import * as React from 'react';
import { ChevronDown } from 'react-feather';
import { Box } from '../Box';
import CurrencyLogo from '../CurrencyLogo';
import { DoubleCurrencyLogo } from '../DoubleCurrencyLogo';
import { TextInput } from '../TextInput';
import { Aligner, CurrencySelect, StyledTokenName } from './styles';
import { CurrencyInputProps } from './types';

const CurrencyInput: React.FC<CurrencyInputProps> = (props) => {
  const {
    pair,
    currency,
    onTokenClick,
    textPrimaryColor,
    textSecondaryColor,
    selectPrimaryBgColor,
    selectSecondaryBgColor,
    inputFieldBgColor,
    ...rest
  } = props;

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
        <StyledTokenName className="pair-name-container" style={textPrimaryColor ? { color: textPrimaryColor } : {}}>
          {pair?.token0.symbol}:{pair?.token1.symbol}
        </StyledTokenName>
      );
    } else
      return (
        <StyledTokenName
          className="token-symbol-container"
          active={Boolean(currency && currency.symbol)}
          style={textPrimaryColor ? { color: textPrimaryColor } : {}}
        >
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
        style={
          selectSecondaryBgColor && selectPrimaryBgColor
            ? Boolean(currency && currency.symbol)
              ? { backgroundColor: selectSecondaryBgColor }
              : { backgroundColor: selectPrimaryBgColor }
            : {}
        }
      >
        <Aligner>
          {renderCurrency()}
          {renderStyletoken()}
          <ChevronDown
            color={!Boolean(currency && currency.symbol) ? 'black' : undefined}
            style={textPrimaryColor ? { color: textPrimaryColor } : {}}
          />
        </Aligner>
      </CurrencySelect>
    );
  };
  return (
    <Box>
      <TextInput
        {...(rest as any)}
        addonAfter={addonAfter()}
        textSecondaryColor={textSecondaryColor}
        inputFieldBgColor={inputFieldBgColor}
      />
    </Box>
  );
};

export default CurrencyInput;
