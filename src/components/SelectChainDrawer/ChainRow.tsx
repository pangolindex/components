import { Chain, Currency } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { CurrencyLogo, Text } from '..';
import { ChainRowRoot } from './styled';

interface Props {
  chain: Chain;
  style: any;
  onSelect: (chain: Chain) => void;
  isSelected: boolean;
  otherSelected: boolean;
}

const ChainRow: React.FC<Props> = (props) => {
  const { chain, style, onSelect, isSelected, otherSelected } = props;
  const currency: Currency = chain?.nativeCurrency;

  const handleSelect = useCallback(() => {
    onSelect(chain);
  }, [onSelect, chain]);

  return (
    <ChainRowRoot style={style} onClick={handleSelect} disabled={isSelected} selected={otherSelected}>
      <CurrencyLogo currency={currency} size={24} imageSize={48} />
      <Text color="swapWidget.primary" fontSize={14} title={currency?.name}>
        {currency?.name}
      </Text>
    </ChainRowRoot>
  );
};
export default ChainRow;
