import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { Box } from '../Box';
import DropdownMenu from '.';

export default {
  component: DropdownMenu,
  title: 'Components/Dropdownmenu',
  args: {
    activeMenu: 'open',
  },
};

const TemplateSimpleDropdown: ComponentStory<typeof DropdownMenu> = () => {
  const LimitOrderTypeOptions = [
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
  ];

  const [activeMenu, setMenu] = useState('');

  return (
    <Box width="100%">
      <Box maxWidth="150px">
        <DropdownMenu
          title="Option:"
          options={LimitOrderTypeOptions}
          value={activeMenu}
          onSelect={(value) => {
            setMenu(value);
          }}
        />
      </Box>
    </Box>
  );
};

export const Dafault = TemplateSimpleDropdown.bind({});
