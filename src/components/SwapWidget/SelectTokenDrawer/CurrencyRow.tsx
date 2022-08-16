import { Currency } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { LoaderIcon } from 'src/components/Icons';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useCurrencyBalance } from 'src/state/pwallet/hooks';
import { CurrencyLogo, Text } from '../../';
import { Balance, CurrencyRowRoot } from './styled';

interface Props {
  currency: Currency;
  style: any;
  onSelect: (currency: Currency) => void;
  isSelected: boolean;
  otherSelected: boolean;
  textPrimaryColor?: string;
}

const CurrencyRow: React.FC<Props> = (props) => {
  const { currency, style, onSelect, isSelected, otherSelected, textPrimaryColor } = props;
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const balance = useCurrencyBalance(chainId, account ?? undefined, currency);

  const handleSelect = useCallback(() => {
    onSelect(currency);
  }, [onSelect, currency]);

  return (
    <CurrencyRowRoot style={style} onClick={handleSelect} disabled={isSelected} selected={otherSelected}>
      <CurrencyLogo currency={currency} size={24} imageSize={48} />
      <Text
        color="text1"
        fontSize={14}
        title={currency?.name}
        style={textPrimaryColor ? { color: textPrimaryColor } : {}}
      >
        {currency?.symbol}
      </Text>
      <Balance color="text1" fontSize={14} style={textPrimaryColor ? { color: textPrimaryColor } : {}}>
        {balance ? balance.toSignificant(4) : account ? <LoaderIcon /> : null}
      </Balance>
    </CurrencyRowRoot>
  );
};
export default CurrencyRow;
