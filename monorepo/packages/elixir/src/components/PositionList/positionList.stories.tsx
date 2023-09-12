import { Box } from '@honeycomb/core';
import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { MenuType } from '../Sidebar/types';
import { PositionListProps } from './types';
import PositionList from '.';

export default {
  component: PositionList,
  title: 'DeFi Primitives/Elixir/PositionList',
  parameters: {
    docs: {
      description: {
        component: 'Position List',
      },
    },
  },
  argTypes: {
    isLoading: {
      name: 'Is Loading',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'It turns loader on and off',
    },
    doesNotPoolExist: {
      name: 'Does Not Pool Exist',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'It shows the pool does not exist',
    },
    searchQuery: {
      name: 'Search Query',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Search Query',
    },
    sortBy: {
      name: 'Sort By',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Sort By',
    },
    activeMenu: {
      name: 'Active Menu',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Active Menu',
    },
    menuItems: {
      name: 'Menu Items',
      control: 'array',
      type: { name: 'array', required: false },
      description: 'Menu Items',
    },
    onChangeSortBy: {
      name: 'On Change Sort By',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when user change the sort by',
    },
    handleSearch: {
      name: 'Handle Search',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when user search',
    },
    setMenu: {
      name: 'Set Menu',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when user change the menu',
    },
  },
};

const menuItems: Array<{ label: string; value: string }> = Object.keys(MenuType).map((key) => ({
  label: MenuType[key],
  value: MenuType[key],
}));

const TemplatePositionList: ComponentStory<typeof PositionList> = (args: any) => {
  const [activeMenu, setMenu] = useState<string>(MenuType.allPositions);

  return (
    <Box>
      <PositionList {...args} activeMenu={activeMenu} setMenu={setMenu} />
    </Box>
  );
};

export const Default = TemplatePositionList.bind({});

Default.args = {
  isLoading: false,
  doesNotPoolExist: true,
  menuItems: menuItems,
  sortBy: '',
  searchQuery: '',
  onChangeSortBy: () => {
    console.log('onChangeSortBy');
  },
  handleSearch: () => {
    console.log('handleSearch');
  },
} as Partial<PositionListProps>;
