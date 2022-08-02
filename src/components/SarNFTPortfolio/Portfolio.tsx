import { BigNumber } from 'ethers';
import React, { useState } from 'react';
import { ONE_ETHER } from 'src/constants';
import { Position } from 'src/state/psarstake/hooks';
import { Box } from '../Box';
import { Button } from '../Button';
import DropdownMenu from '../DropdownMenu';
import Pagination from '../Pagination';
import { Text } from '../Text';
import { Frame, StyledSVG } from './styleds';

interface Props {
  itemsPerPage?: number;
  positions: Position[];
}

export default function Portfolio({ itemsPerPage = 4, positions }: Props) {
  const [currentItems, setCurrentItems] = useState(positions.slice(0, itemsPerPage));
  const [selectedPositon, setSelectedPosition] = useState<Position>({ id: BigNumber.from(-1) } as Position);

  const onSelectPosition = (position: Position) => {
    setSelectedPosition(position?.id.eq(selectedPositon?.id) ? ({ id: BigNumber.from(-1) } as Position) : position);
  };

  const onSelect = (value: string) => {
    if (value === 'apr') {
      setCurrentItems(positions.sort((a, b) => b.apr.sub(a.apr).toNumber()).slice(0, itemsPerPage));
    } else if (value === 'amount') {
      setCurrentItems(
        positions
          .sort((a, b) => {
            return b.amount.sub(a.amount).div(ONE_ETHER).toNumber();
          })
          .slice(0, itemsPerPage),
      );
    } else {
      setCurrentItems(positions.slice(0, itemsPerPage));
    }
  };

  const renderItems = () => {
    return currentItems.map((position, index) => {
      const svg = Buffer.from(position?.uri.image.replace('data:image/svg+xml;base64,', ''), 'base64').toString(); // decode base64
      const isSelected = position?.id.eq(selectedPositon?.id);
      return (
        <Box
          key={index}
          width="100%"
          height="max-content"
          bgColor={isSelected ? 'primary' : undefined}
          borderRadius="5px"
          paddingX="5px"
          paddingBottom="5px"
          style={{ cursor: 'pointer' }}
        >
          <StyledSVG
            onClick={() => onSelectPosition(position)}
            dangerouslySetInnerHTML={{ __html: svg }}
            width="100%"
          />
          <Text color={isSelected ? 'black' : 'text1'} textAlign="center" fontWeight={500}>
            Position id: {position?.id.toString()}
          </Text>
        </Box>
      );
    });
  };

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box display="flex" justifyContent="space-between" mb="20px">
        <Button variant="primary" width="200px">
          + STAKE NEW
        </Button>
        <Box display="flex" style={{ gap: '12px' }}>
          <DropdownMenu
            title="Sort by:"
            onSelect={onSelect}
            value="1"
            options={[
              { label: 'APR', value: 'apr' },
              { label: 'Amount', value: 'amount' },
            ]}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Frame>{renderItems()}</Frame>
        <Pagination items={currentItems} itemsPerPage={itemsPerPage} onChange={(items) => setCurrentItems(items)} />
      </Box>
    </Box>
  );
}
