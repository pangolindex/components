import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Box } from '../Box';
import { Paginate } from './styleds';

interface Props {
  itemsPerPage: number;
  items: any[];
  onChange: (items: any[]) => void;
}

export default function Pagination({ itemsPerPage, items, onChange }: Props) {
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    onChange(items.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(items.length / itemsPerPage));
  }, [itemOffset, itemsPerPage]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paginate
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        previousLabel={<ChevronLeft size={20} />}
        nextLabel={<ChevronRight size={20} />}
        breakLabel="..."
        activeClassName="active"
      />
    </Box>
  );
}
