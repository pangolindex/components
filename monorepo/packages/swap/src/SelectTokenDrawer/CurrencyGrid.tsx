import { CurrencyLogo, Text } from '@pangolindex/core';
import { useChainId, usePangolinWeb3 } from '@pangolindex/shared';
import { Currency } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { LoaderIcon } from 'src/components/Icons';
import { useCurrencyBalance } from 'src/state/pwallet/hooks/common';
import { Balance, CurrencyRoot } from './styled';

interface Props {
  currency: Currency;
  style: any;
  onSelect: (currency: Currency) => void;
  isSelected: boolean;
  otherSelected: boolean;
}

const CurrencyGrid: React.FC<Props> = (props) => {
  const { currency, style, onSelect, isSelected, otherSelected } = props;
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const balance = useCurrencyBalance(chainId, account ?? undefined, currency);

  const handleSelect = useCallback(() => {
    onSelect(currency);
  }, [onSelect, currency]);

  return (
    <CurrencyRoot style={style} onClick={handleSelect} disabled={isSelected} selected={otherSelected}>
      <CurrencyLogo currency={currency} size={24} imageSize={48} />
      <Text
        color="swapWidget.primary"
        fontSize={14}
        title={currency?.name}
        fontWeight={500}
        marginBottom="10px"
        marginTop="5px"
      >
        {currency?.symbol}
      </Text>
      <Balance color="swapWidget.primary" fontSize={14}>
        {balance ? balance.toSignificant(4) : account ? <LoaderIcon /> : null}
      </Balance>
    </CurrencyRoot>
  );
};
export default CurrencyGrid;
