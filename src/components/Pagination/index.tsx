import React from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Box } from '../Box';
import { Paginate } from './styleds';

interface Props {
  pageCount: number;
  forcePage?: number;
  onPageChange: (selectedItem: { selected: number }) => void;
}

export default function Pagination({ pageCount, forcePage, onPageChange }: Props) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paginate
        onPageChange={onPageChange}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        previousLabel={<ChevronLeft size={20} />}
        nextLabel={<ChevronRight size={20} />}
        breakLabel="..."
        activeClassName="active"
        forcePage={forcePage}
      />
    </Box>
  );
}
