import { Currency } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { LoaderIcon } from 'src/components/Icons';
import { useActiveWeb3React, useChainId } from 'src/hooks';
import { useCurrencyBalance } from 'src/state/pwallet/hooks';
import { CurrencyLogo, Text } from '../../';
import { Balance, CurrencyRowRoot } from './styled';

interface Props {
  currency: Currency;
  style: any;
  onSelect: (currency: Currency) => void;
  isSelected: boolean;
  otherSelected: boolean;
}

const CurrencyRow: React.FC<Props> = (props) => {
  const { currency, style, onSelect, isSelected, otherSelected } = props;
  const { account } = useActiveWeb3React();
  const chainId = useChainId();

  const balance = useCurrencyBalance(chainId, account ?? undefined, currency);

  const handleSelect = useCallback(() => {
    onSelect(currency);
  }, [onSelect, currency]);

  return (
    <CurrencyRowRoot style={style} onClick={handleSelect} disabled={isSelected} selected={otherSelected}>
      <CurrencyLogo currency={currency} size={24} imageSize={48} />
      <Text color="text1" fontSize={14} title={currency?.name}>
        {currency?.symbol}
      </Text>
      <Balance color="text1" fontSize={14}>
        {balance ? balance.toSignificant(4) : account ? <LoaderIcon /> : null}
      </Balance>
    </CurrencyRowRoot>
  );
};
export default CurrencyRow;
