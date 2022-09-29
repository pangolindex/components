import { formatEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMedia, useWindowSize } from 'react-use';
import { Position } from 'src/state/psarstake/hooks';
import { MEDIA_WIDTHS } from 'src/theme';
import { scrollElementIntoView } from 'src/utils';
import { Box } from '../Box';
import DropdownMenu from '../DropdownMenu';
import Pagination from '../Pagination';
import { Text } from '../Text';
import { Frame, StyledSVG } from './styleds';

interface Props {
  positions: Position[];
  onSelectPosition: (position: Position | null) => void;
}

export default function Portfolio({ positions, onSelectPosition }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [currentItems, setCurrentItems] = useState(positions.slice(0, itemsPerPage));
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedPositonId, setSelectedPositionId] = useState<BigNumber | null>(null);
  const [page, setPage] = useState<number | undefined>();

  const node = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const isMobile = useMedia(`(max-width: ${MEDIA_WIDTHS.upToMedium}px)`);

  function sortItems(itemOffset: number, endOffset: number, sortOption: string) {
    if (sortOption === 'apr') {
      setCurrentItems([...positions].sort((a, b) => b.apr.sub(a.apr).toNumber()).slice(itemOffset, endOffset));
    } else if (sortOption === 'amount') {
      setCurrentItems(
        [...positions]
          .sort((a, b) => {
            return parseFloat(formatEther(b.balance.sub(a.balance)));
          })
          .slice(itemOffset, endOffset),
      );
    } else if (sortOption === 'newest') {
      setCurrentItems([...positions].sort((a, b) => b.id.sub(a.id).toNumber()).slice(itemOffset, endOffset));
    } else if (sortOption === 'oldest') {
      setCurrentItems([...positions].sort((a, b) => a.id.sub(b.id).toNumber()).slice(itemOffset, endOffset));
    } else {
      setCurrentItems(positions.slice(itemOffset, endOffset));
    }
  }
  const onSelect = (value) => {
    setSelectedOption(value as string);
    sortItems(0, itemsPerPage, value as string);
    setPage(0);
    setItemOffset(0);
  };

  const { width, height } = useWindowSize();

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    sortItems(itemOffset, endOffset, selectedOption || '');
    setPageCount(Math.ceil(positions.length / itemsPerPage));
    setPage(undefined);
  }, [positions, itemOffset, itemsPerPage]);

  // calcule items per page based on node size and image size
  useEffect(() => {
    if (node.current && imageRef.current) {
      const nodeWidth = node.current.offsetWidth;
      const nodeHeight = node.current.offsetHeight;
      const imageWidth = imageRef.current.offsetWidth;
      const imageHeight = imageRef.current.offsetHeight;
      // number of columns = node width  / image width
      // number of rows = node height / image height
      // items per page = number of columns * number of rows
      let _itemsPerPage = Math.floor(nodeWidth / imageWidth); // calculate number of columns
      _itemsPerPage = _itemsPerPage * Math.floor(nodeHeight / imageHeight); // calculate number of rows
      setItemsPerPage(_itemsPerPage);
    } else {
      setItemsPerPage(12); // fallback to show 12 items per page
    }
    setPage(undefined);
  }, [width, height]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % positions.length;
    setItemOffset(newOffset);
  };

  const renderItems = () => {
    return currentItems.map((position, index) => {
      const svg = Buffer.from(position?.uri.image.replace('data:image/svg+xml;base64,', ''), 'base64').toString(); // decode base64
      const isSelected = !!selectedPositonId && position?.id.eq(selectedPositonId);
      return (
        <Box
          key={index}
          width="100%"
          height="max-content"
          bgColor={isSelected ? 'primary' : undefined}
          borderRadius="5px"
          paddingX="5px"
          paddingBottom="5px"
          style={{ cursor: 'pointer', boxSizing: 'border-box' }}
          onClick={() => {
            if (isMobile) {
              const element = document.getElementById('sar-manage-widget');
              scrollElementIntoView(element, 'smooth');
            }
            setSelectedPositionId(isSelected ? null : position.id);
            onSelectPosition(isSelected ? null : position);
          }}
          ref={imageRef}
        >
          <StyledSVG key={svg} dangerouslySetInnerHTML={{ __html: svg }} width="100%" />
          <Text color={isSelected ? 'black' : 'text1'} textAlign="center" fontWeight={500}>
            {t('sarPortfolio.positionId')}: {position?.id.toString()}
          </Text>
        </Box>
      );
    });
  };

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box display="flex" justifyContent="end" mb="20px">
        <DropdownMenu
          placeHolder={`${t('sarPortfolio.sortBy')}:`}
          onSelect={onSelect}
          defaultValue={selectedOption}
          isMulti={false}
          options={[
            { label: t('sarPortfolio.apr'), value: 'apr' },
            { label: t('sarPortfolio.amount'), value: 'amount' },
            { label: t('sarPortfolio.newest'), value: 'newest' },
            { label: t('sarPortfolio.oldest'), value: 'oldest' },
          ]}
        />
      </Box>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Frame ref={node}>{renderItems()}</Frame>
        <Pagination pageCount={pageCount} onPageChange={handlePageClick} forcePage={page} />
      </Box>
    </Box>
  );
}
