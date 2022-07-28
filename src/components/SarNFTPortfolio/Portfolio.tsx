import React, { useEffect, useState } from 'react';
import { MEDIA_WIDTHS } from 'src/theme';
import { Box } from '../Box';
import { Button } from '../Button';
import DropdownMenu from '../DropdownMenu';
import Pagination from '../Pagination';
import { Text } from '../Text';
import { Frame } from './styleds';

const items = [...Array(40).keys()];

interface Props {
  itemsPerPage?: number;
}

export default function Portfolio({ itemsPerPage = 12 }: Props) {
  const [_itemsPerPage, setitemsPerPage] = useState(itemsPerPage);
  const [currentItems, setCurrentItems] = useState(items.slice(0, _itemsPerPage));
  const onSelect = (value: string) => {
    console.log(value);
  };

  // pseudo responsive
  useEffect(() => {
    function handleResize() {
      const { innerWidth: width } = window;
      if (width <= MEDIA_WIDTHS.upToSmall) setitemsPerPage(2);
      else if (width <= MEDIA_WIDTHS.upToMedium) setitemsPerPage(4);
      else if (width <= MEDIA_WIDTHS.upToLarge) setitemsPerPage(8);
      else setitemsPerPage(12);
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderItems = () => {
    return currentItems.map((item) => {
      return (
        <Box key={item} minHeight="300px">
          <Text color="text1">{item}</Text>
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
            onSelect={onSelect}
            title="Filter:"
            value="1"
            options={[
              { label: '1', value: 1 },
              { label: '2', value: 1 },
              { label: '3', value: 1 },
            ]}
          />
          <DropdownMenu
            title="Sort by:"
            onSelect={onSelect}
            value="2"
            options={[
              { label: '2', value: 1 },
              { label: '2', value: 1 },
            ]}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Frame>{renderItems()}</Frame>
        <Pagination items={items} itemsPerPage={_itemsPerPage} onChange={(items) => setCurrentItems(items)} />
      </Box>
    </Box>
  );
}
