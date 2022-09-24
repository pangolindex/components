import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { MultiValue, SingleValue } from 'react-select';
import { Box } from '../Box';
import DropdownMenu, { DropdownMenuProps } from '.';

export default {
  component: DropdownMenu,
  title: 'Components/Dropdownmenu',
  args: {
    activeMenu: 'open',
  },
};

const TemplateSimpleDropdown: ComponentStory<typeof DropdownMenu> = (args: any) => {
  const [activeMenu, setMenu] = useState<MultiValue<string> | SingleValue<string>>('');

  return (
    <Box width="100%">
      <Box maxWidth="150px">
        <DropdownMenu
          {...args}
          defaultValue={activeMenu}
          onSelect={(value) => {
            setMenu(value);
          }}
        />
      </Box>
    </Box>
  );
};

export const Default = TemplateSimpleDropdown.bind({});
Default.args = {
  defaultValue: 'open',
  onSelect: () => {},
  placeHolder: 'Dropdown Title',
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
  height: '35px',
} as Partial<DropdownMenuProps>;
