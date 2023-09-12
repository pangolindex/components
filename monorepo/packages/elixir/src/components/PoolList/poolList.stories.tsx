import { Box } from '@honeycomb/core';
import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { MenuType } from '../Sidebar/types';
import { PoolListProps } from './types';
import PoolList from '.';

export default {
  component: PoolList,
  title: 'DeFi Primitives/Elixir/PoolList',
  parameters: {
    docs: {
      description: {
        component: 'Pool List',
      },
    },
  },
  argTypes: {
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

const TemplatePositionList: ComponentStory<typeof PoolList> = (args: any) => {
  const [activeMenu, setMenu] = useState<string>(MenuType.topPools);

  return (
    <Box>
      <PoolList {...args} activeMenu={activeMenu} setMenu={setMenu} />
    </Box>
  );
};

export const Default = TemplatePositionList.bind({});

Default.args = {
  menuItems: menuItems,
} as Partial<PoolListProps>;
