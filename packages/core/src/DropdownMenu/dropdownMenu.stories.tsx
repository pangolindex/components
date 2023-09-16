import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { MultiValue } from 'react-select';
import { Box } from '../Box';
import DropdownMenu, { DropdownMenuProps } from '.';

export default {
  component: DropdownMenu,
  title: 'Building Blocks/Dropdownmenu',
  args: {
    activeMenu: 'open',
  },
  parameters: {
    docs: {
      description: {
        component: 'Dropdown Menu Component',
      },
    },
  },
  argTypes: {
    options: {
      name: 'Options',
      control: 'array',
      type: { name: 'array', required: true },
      description: 'Array of options that populate the select menu',
    },
    menuPlacement: {
      name: 'Menu Placement',
      control: 'select',
      options: ['bottom', 'top', 'auto'],
      type: { name: 'string', required: true },
      defaultValue: 'auto',
      description: 'Default placement of the menu in relation to the control.',
    },
    isMulti: {
      name: 'IsMulti',
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: false,
      description: 'Allows the user to select multiple options',
    },
    placeHolder: {
      name: 'PlaceHolder',
      control: 'text',
      type: { name: 'string', required: false },
      defaultValue: 'Select',
      description: 'Placeholder text for the dropdown component',
    },
    height: {
      name: 'Height',
      control: 'text',
      type: { name: 'string', required: false },
      defaultValue: '54px',
      description: 'Height of the dropdown component',
    },
    onSelect: {
      name: 'OnSelect',
      control: 'function',
      type: { name: 'function', required: false },
      default: () => {},
      description: 'Function that is called when an option is selected',
    },
    defaultValue: {
      name: 'Default Value',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Default value of the dropdown component',
    },
  },
};

const TemplateSimpleDropdown: ComponentStory<typeof DropdownMenu> = (args: any) => {
  const [activeMenu, setMenu] = useState<MultiValue<string> | string>('');

  return (
    <Box width="100%">
      <Box maxWidth="350px">
        <DropdownMenu
          {...args}
          defaultValue={activeMenu}
          onSelect={(value: string | MultiValue<string>) => {
            setMenu(value);
          }}
        />
      </Box>
    </Box>
  );
};

export const Default = TemplateSimpleDropdown.bind({});
Default.args = {
  defaultValue: '',
  onSelect: () => {},
  placeHolder: 'Select',
  isMulti: false,
  menuPlacement: 'auto',
  options: [
    {
      label: 'open',
      value: 'open',
    },
    {
      label: 'executed',
      value: 'executed',
    },
    {
      label: 'cancelled',
      value: 'cancelled',
    },
  ],
  height: '50px',
} as Partial<DropdownMenuProps>;
