import { SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import React from 'react';
import { SortableHeader, StyledTD, StyledTH, StyledTR, StyledTable } from './styles';
import { DataTableProps } from './types';

const DataTable: React.FC<DataTableProps> = (props) => {
  const { columns, data, debugTable, styleOverrideTH, styleOverrideTD, styleOverrideTR, styleOverrideTable } = props;
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable,
  });

  return (
    <StyledTable styleOverride={styleOverrideTable}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <StyledTR key={headerGroup.id} styleOverride={styleOverrideTR}>
            {headerGroup.headers.map((header) => (
              <StyledTH key={header.id} colSpan={header.colSpan} styleOverride={styleOverrideTH}>
                {header.isPlaceholder ? null : (
                  <SortableHeader
                    canSort={header.column.getCanSort()}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </SortableHeader>
                )}
              </StyledTH>
            ))}
          </StyledTR>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <StyledTD key={cell.id} styleOverride={styleOverrideTD}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </StyledTD>
            ))}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
};

export default DataTable;
