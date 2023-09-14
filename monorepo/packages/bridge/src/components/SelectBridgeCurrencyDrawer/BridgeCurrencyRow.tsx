import { Text } from '@honeycomb-finance/core';
import { BridgeCurrency } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { HelpCircle } from 'react-feather';
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
      {bridgeCurrency?.logo && bridgeCurrency?.logo?.length > 0 ? (
        <BridgeCurrencyLogo src={bridgeCurrency?.logo} size={24} />
      ) : (
        <HelpCircle size={24} style={{ marginRight: '10px' }} />
      )}
      <Text color="bridge.text" fontSize={14} title={bridgeCurrency?.name}>
        {bridgeCurrency?.symbol}
      </Text>
    </BridgeCurrencyRowRoot>
  );
};
export default BridgeCurrencyRow;
