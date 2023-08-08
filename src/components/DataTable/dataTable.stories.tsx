import { ComponentStory } from '@storybook/react';
import React from 'react';
import DataTable from '.';

export default {
  component: DataTable,
  title: 'DeFi Helpers/DataTables',
  parameters: {
    docs: {
      description: {
        component:
          'DataTable component for displaying tables. Uses [react-table](https://www.npmjs.com/package/@tanstack/react-table) under the hood.',
      },
    },
  },
  argTypes: {
    data: { control: 'object', description: 'Data for the table' },
    columns: { control: 'object', description: 'Columns configuration for the table' },
    debugTable: { control: 'boolean', description: 'Enable/Disable table debugging' },
    styleOverrideTH: { control: 'text', description: 'Override styles for TH' },
    styleOverrideTD: { control: 'text', description: 'Override styles for TD' },
    styleOverrideTR: { control: 'text', description: 'Override styles for TR' },
    styleOverrideTable: { control: 'text', description: 'Override styles for Table' },
  },
};

const dummyData = [
  {
    id: 1,
    name: 'John Doe',
    age: 32,
  },
  {
    id: 2,
    name: 'Jane Doe',
    age: 31,
  },
  {
    id: 3,
    name: 'Mario Rossi',
    age: 39,
  },
];

const dummyColumns = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
  },
  {
    header: 'Title',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'age',
        header: () => 'Age',
        footer: (props) => props.column.id,
      },
    ],
  },
];

const TemplateDataTable: ComponentStory<typeof DataTable> = (args: any) => (
  <div style={{ width: '100%', height: '100%' }}>
    <DataTable {...args} />
  </div>
);

export const Default = TemplateDataTable.bind({});
Default.args = {
  data: dummyData,
  columns: dummyColumns,
  debugTable: false,
  styleOverrideTable: 'background: #ffffff;',
  styleOverrideTD: undefined,
  styleOverrideTH: undefined,
  styleOverrideTR: undefined,
};
