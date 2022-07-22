import { Pair } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { Box, DoubleCurrencyLogo, Text } from 'src/components';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useTokenBalance } from 'src/state/pwallet/hooks';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { Balance, CurrencyRowRoot } from './styled';

interface Props {
  pair: Pair;
  style: any;
  onSelect: (pair: Pair) => void;
  isSelected: boolean;
}

const PoolRow: React.FC<Props> = (props) => {
  const { pair, style, onSelect, isSelected } = props;

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const currency0 = unwrappedToken(pair.token0, chainId);
  const currency1 = unwrappedToken(pair.token1, chainId);

  const userPgl = useTokenBalance(account ?? undefined, pair?.liquidityToken);

  const handleSelect = useCallback(() => {
    onSelect(pair);
  }, [onSelect, pair]);

  return (
    <CurrencyRowRoot style={style} onClick={handleSelect} disabled={isSelected}>
      <Box display="flex" alignItems="center">
        <DoubleCurrencyLogo size={24} currency0={currency0} currency1={currency1} />
        <Text color="text2" fontSize={16} fontWeight={500} lineHeight="40px" marginLeft={10}>
          {currency0?.symbol}/{currency1?.symbol}
        </Text>
      </Box>
      <Balance color="text1" fontSize={14}>
        {userPgl ? userPgl.toSignificant(4) : '-'}
      </Balance>
    </CurrencyRowRoot>
  );
};
export default PoolRow;
