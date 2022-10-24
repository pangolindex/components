import { BridgeCurrency, Currency } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useCurrencyBalance } from 'src/state/pwallet/hooks';
import { Text } from '..';
import { LoaderIcon } from '../Icons';
import { Balance, BridgeCurrencyLogo, BridgeCurrencyRowRoot } from './styled';

interface Props {
  bridgeCurrency: BridgeCurrency;
  style: any;
  onSelect: (bridgeCurrency: BridgeCurrency) => void;
  isSelected: boolean;
  otherSelected: boolean;
}

const BridgeCurrencyRow: React.FC<Props> = (props) => {
  const { bridgeCurrency, style, onSelect, isSelected, otherSelected } = props;
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const balance = useCurrencyBalance(chainId, account ?? undefined, bridgeCurrency as Currency);
  const handleSelect = useCallback(() => {
    onSelect(bridgeCurrency);
  }, [onSelect, bridgeCurrency]);

  //TODO: swapWidget replace
  return (
    <BridgeCurrencyRowRoot style={style} onClick={handleSelect} disabled={isSelected} selected={otherSelected}>
      <BridgeCurrencyLogo src={bridgeCurrency?.logo} size={24} />
      <Text color="swapWidget.primary" fontSize={14} title={bridgeCurrency?.name}>
        {bridgeCurrency?.symbol}
      </Text>
      <Balance color="swapWidget.primary" fontSize={14}>
        {balance ? balance.toSignificant(4) : account ? <LoaderIcon /> : null}
      </Balance>
    </BridgeCurrencyRowRoot>
  );
};
export default BridgeCurrencyRow;
