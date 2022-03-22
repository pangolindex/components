import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import Drawer from '.';

export default {
  component: Drawer,
  title: 'Pangolin/Drawer',
  args: {
    open: false,
  },
};

const TemplateSimpleDrawer: ComponentStory<typeof Drawer> = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div style={{ background: '#000', padding: 50 }} onClick={() => setOpen(true)}>
      <Drawer isOpen={open} onClose={() => setOpen(false)}>
        <div style={{ background: '#fff' }}>Open Drawer</div>
      </Drawer>
    </div>
  );
};

export const Simple = TemplateSimpleDrawer.bind({});
