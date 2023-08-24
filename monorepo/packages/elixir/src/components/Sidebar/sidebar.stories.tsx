import { ComponentStory } from '@storybook/react';
import React from 'react';
import { MenuType, SidebarProps } from './types';
import Sidebar from '.';

export default {
  component: Sidebar,
  title: 'DeFi Primitives/Elixir/Sidebar',
  parameters: {
    docs: {
      description: {
        component: 'Sidebar',
      },
    },
  },
  argTypes: {
    activeMenu: {
      name: 'Active Menu',
      control: 'select',
      type: { name: 'string', required: true },
      options: Object.keys(MenuType),
      description: 'Active Menu',
    },
    menuItems: {
      name: 'Menu Items',
      control: 'array',
      type: { name: 'array', required: true },
      description: 'Menu Items',
    },
    setMenu: {
      name: 'Set Menu',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user click on menu item',
    },
    changeAddLiquidityModalStatus: {
      name: 'Change Add Liquidity Modal Status',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user click on "Add liquidity" link.',
    },
  },
};

const TemplateSidebar: ComponentStory<typeof Sidebar> = (args: any) => (
  <div>
    <Sidebar {...args} />
  </div>
);

const menuItems: Array<{ label: string; value: string }> = Object.keys(MenuType).map((key) => ({
  label: MenuType[key],
  value: MenuType[key],
}));

export const Default = TemplateSidebar.bind({});
Default.args = {
  activeMenu: MenuType.allPositions,
  menuItems,
  setMenu: () => {},
  changeAddLiquidityModalStatus: () => {},
} as Partial<SidebarProps>;
