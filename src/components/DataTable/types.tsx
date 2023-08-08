import { ColumnDef } from '@tanstack/react-table';

export type DataTableProps = {
  columns: ColumnDef<unknown, any>[];
  data: unknown[];
  debugTable: boolean;
  styleOverrideTH?: string;
  styleOverrideTD?: string;
  styleOverrideTR?: string;
  styleOverrideTable?: string;
};
