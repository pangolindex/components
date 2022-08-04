import { formatEther } from '@ethersproject/units';
import React, { useState } from 'react';
import { Position } from 'src/state/psarstake/hooks';
import { Box } from '../Box';
import DropdownMenu from '../DropdownMenu';
import Pagination from '../Pagination';
import { Text } from '../Text';
import { Frame, StyledSVG } from './styleds';

interface Props {
  itemsPerPage?: number;
  positions: Position[];
  onSelectPosition: (position: Position | null) => void;
}

export default function Portfolio({ itemsPerPage = 12, positions, onSelectPosition }: Props) {
  const [currentItems, setCurrentItems] = useState(positions.slice(0, itemsPerPage));
  const [selectedPositon, setSelectedPosition] = useState<Position | null>(null);

  const onSelect = (value: string) => {
    if (value === 'apr') {
      setCurrentItems(positions.sort((a, b) => b.apr.sub(a.apr).toNumber()).slice(0, itemsPerPage));
    } else if (value === 'amount') {
      setCurrentItems(
        positions
          .sort((a, b) => {
            return parseFloat(formatEther(b.amount.sub(a.amount)));
          })
          .slice(0, itemsPerPage),
      );
    } else if (value === 'newest') {
      setCurrentItems(positions.sort((a, b) => b.id.sub(a.id).toNumber()).slice(0, itemsPerPage));
    } else if (value === 'oldest') {
      setCurrentItems(positions.sort((a, b) => a.id.sub(b.id).toNumber()).slice(0, itemsPerPage));
    } else {
      setCurrentItems(positions.slice(0, itemsPerPage));
    }
  };

  const renderItems = () => {
    return currentItems.map((position, index) => {
      const svg = Buffer.from(position?.uri.image.replace('data:image/svg+xml;base64,', ''), 'base64').toString(); // decode base64
      const isSelected = !!selectedPositon && position?.id.eq(selectedPositon?.id);
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
          onClick={() => {
            setSelectedPosition(isSelected ? null : position);
            onSelectPosition(isSelected ? null : position);
          }}
        >
          <StyledSVG dangerouslySetInnerHTML={{ __html: svg }} width="100%" />
          <Text color={isSelected ? 'black' : 'text1'} textAlign="center" fontWeight={500}>
            Position id: {position?.id.toString()}
          </Text>
        </Box>
      );
    });
  };

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box display="flex" justifyContent="end" mb="20px">
        <DropdownMenu
          title="Sort by:"
          onSelect={onSelect}
          value="1"
          options={[
            { label: 'APR', value: 'apr' },
            { label: 'Amount', value: 'amount' },
            { label: 'newest', value: 'newest' },
            { label: 'oldest', value: 'oldest' },
          ]}
        />
      </Box>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Frame>{renderItems()}</Frame>
        <Pagination items={currentItems} itemsPerPage={itemsPerPage} onChange={(items) => setCurrentItems(items)} />
      </Box>
    </Box>
  );
}
