import { Currency } from '@pangolindex/sdk';
import * as React from 'react';
import { ChevronDown } from 'react-feather';
import { Box } from '../Box';
import CurrencyLogo from '../CurrencyLogo';
import { Aligner, ChainSelect, StyledTokenName } from './styles';
import { ChainInputProps } from './types';

const ChainInput = ({ buttonStyle, chain, onChainClick }: ChainInputProps) => {
  const renderChain = () => {
    if (chain) {
      return <CurrencyLogo currency={chain.nativeCurrency as Currency} size={24} imageSize={48} />;
    } else {
      return null;
    }
  };

  const renderStyletoken = () => {
    return (
      //TODO: 'Select Chain' -> i18n
      <StyledTokenName className="token-symbol-container" active={Boolean(chain && chain.symbol)}>
        {(chain && chain.name && chain.name.length > 20
          ? chain.name.slice(0, 4) + '...' + chain.name.slice(chain.name.length - 5, chain.name.length)
          : chain?.name) || 'Select Chain'}
      </StyledTokenName>
    );
  };

  const addonAfter = () => {
    return (
      <ChainSelect
        selected={!!chain}
        className="open-chain-select-button"
        onClick={() => {
          onChainClick && onChainClick();
        }}
        buttonStyle={buttonStyle}
      >
        <Aligner active={Boolean(chain && chain.symbol)}>
          {renderChain()}
          {renderStyletoken()}
          <ChevronDown color={!Boolean(chain && chain.symbol) ? 'black' : undefined} />
        </Aligner>
      </ChainSelect>
    );
  };

  return <Box>{addonAfter()}</Box>;
};

export default ChainInput;
