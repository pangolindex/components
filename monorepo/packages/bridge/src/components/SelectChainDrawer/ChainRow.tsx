import { Text } from '@honeycomb-finance/core';
import { Chain } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { ChainLogo, ChainRowRoot } from './styled';

interface Props {
  chain: Chain;
  style: any;
  onSelect: (chain: Chain) => void;
  isSelected: boolean;
  otherSelected: boolean;
}

const ChainRow: React.FC<Props> = (props) => {
  const { chain, style, onSelect, isSelected, otherSelected } = props;

  const handleSelect = useCallback(() => {
    onSelect(chain);
  }, [onSelect, chain]);

  return (
    <ChainRowRoot style={style} onClick={handleSelect} disabled={isSelected} selected={otherSelected}>
      <ChainLogo src={chain?.logo} width={24} height={24} />
      <Text color="swapWidget.primary" fontSize={14} title={chain?.name}>
        {chain?.name}
      </Text>
    </ChainRowRoot>
  );
};
export default ChainRow;
