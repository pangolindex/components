import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
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

  const [activeMenu, setMenu] = useState('open');

  return (
    <DropdownMenu
      options={LimitOrderTypeOptions}
      value={activeMenu}
      onSelect={(value) => {
        setMenu(value);
      }}
    />
  );
};

export const Dafault = TemplateSimpleDropdown.bind({});
