import { BridgeCurrency } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { Text } from '..';
import { BridgeCurrencyLogo, BridgeCurrencyRowRoot } from './styled';

interface Props {
  bridgeCurrency: BridgeCurrency;
  style: any;
  onSelect: (bridgeCurrency: BridgeCurrency) => void;
  isSelected: boolean;
  otherSelected: boolean;
}

const BridgeCurrencyRow: React.FC<Props> = (props) => {
  const { bridgeCurrency, style, onSelect, isSelected, otherSelected } = props;

  const handleSelect = useCallback(() => {
    onSelect(bridgeCurrency);
  }, [onSelect, bridgeCurrency]);

  return (
    <BridgeCurrencyRowRoot style={style} onClick={handleSelect} disabled={isSelected} selected={otherSelected}>
      <BridgeCurrencyLogo src={bridgeCurrency?.logo} size={24} />
      <Text color="bridge.text" fontSize={14} title={bridgeCurrency?.name}>
        {bridgeCurrency?.symbol}
      </Text>
    </BridgeCurrencyRowRoot>
  );
};
export default BridgeCurrencyRow;
