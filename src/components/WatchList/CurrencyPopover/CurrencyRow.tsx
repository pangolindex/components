import React, { useCallback } from 'react';
import { Box, Button, Text } from 'src/components';
import { CoingeckoWatchListToken } from 'src/state/pcoingecko/hooks';
import { RowWrapper } from './styled';

type Props = {
  currency: CoingeckoWatchListToken;
  onSelect: (address: string) => void;
  style: any;
  isSelected: boolean;
};

const WatchlistCurrencyRow: React.FC<Props> = ({ currency, onSelect, style, isSelected }) => {
  const handleSelect = useCallback(() => {
    onSelect(currency?.id);
  }, [onSelect, currency]);

  return (
    <RowWrapper disabled={isSelected} style={style}>
      <Box display="flex" alignItems="center">
        <img src={currency?.imageUrl ? currency?.imageUrl : ''} height={24} width={24} />
        <Text color="text1" fontSize={14} fontWeight={400} marginLeft={'6px'}>
          {currency?.symbol}
        </Text>
      </Box>

      <Box ml={'10px'} textAlign="right">
        <Text color="text1" fontSize={14} fontWeight={400}>
          ${currency?.price ? currency?.price : '-'}
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
