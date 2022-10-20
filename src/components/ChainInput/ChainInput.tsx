import * as React from 'react';
import { ChevronDown } from 'react-feather';
import { Box } from '../Box';
import { Aligner, ChainLogo, ChainSelect, StyledTokenName } from './styles';
import { ChainInputProps } from './types';

const ChainInput = ({ buttonStyle, chain, onChainClick }: ChainInputProps) => {
  const renderChain = () => {
    if (chain) {
      return <ChainLogo src={chain?.logo} width={24} height={24} />;
    } else {
      return null;
    }
  };

  const renderStyletoken = () => {
    return (
      //TODO: 'Select Chain' -> i18n
      <StyledTokenName className="token-symbol-container" active={Boolean(chain && chain.symbol)}>
        {(chain && chain.symbol && chain.symbol.length > 20
          ? chain.symbol.slice(0, 4) + '...' + chain.symbol.slice(chain.symbol.length - 5, chain.symbol.length)
          : chain?.symbol) || 'Select Chain'}
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
