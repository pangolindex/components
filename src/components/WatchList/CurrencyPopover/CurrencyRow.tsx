import { Token } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { Box, Button, CurrencyLogo, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice';
import { useIsSelectedCurrency } from 'src/state/pwatchlists/hooks';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { RowWrapper } from './styled';

type Props = {
  currency: Token;
  onSelect: (address: string) => void;
  style: any;
};

const WatchlistCurrencyRow: React.FC<Props> = ({ currency, onSelect, style }) => {
  const usdcPrice = useUSDCPrice(currency);
  const isSelected = useIsSelectedCurrency(currency?.address);

  const chainId = useChainId();

  const handleSelect = useCallback(() => {
    onSelect(currency?.address);
  }, [onSelect, currency]);

  const token = unwrappedToken(currency, chainId);

  return (
    <RowWrapper disabled={isSelected} style={style}>
      <Box display="flex" alignItems="center">
        <CurrencyLogo size={24} currency={token} />
        <Text color="text1" fontSize={14} fontWeight={400} marginLeft={'6px'}>
          {token?.symbol}
        </Text>
      </Box>

      <Box ml={'10px'} textAlign="right">
        <Text color="text1" fontSize={14} fontWeight={400}>
          ${usdcPrice ? usdcPrice?.toSignificant(4, { groupSeparator: ',' }) : '-'}
        </Text>
      </Box>
      <Box ml={'10px'} textAlign="right">
        <Button
          variant="secondary"
          backgroundColor="bg9"
          color="text6"
          padding={'0px'}
          onClick={handleSelect}
          height="24px"
        >
          Add
        </Button>
      </Box>
    </RowWrapper>
  );
};

export default WatchlistCurrencyRow;
