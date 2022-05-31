import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import Drawer from '.';

export default {
  component: Drawer,
  title: 'Components/Drawer',
  args: {
    open: false,
  },
};

const TemplateSimpleDrawer: ComponentStory<typeof Drawer> = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      style={{
        background: '#000',
        padding: 50,
        width: '300px',
        height: '300px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '10px',
      }}
    >
      <span style={{ color: '#fff' }} onClick={() => setOpen(true)}>
        Click Here
      </span>
      <Drawer isOpen={open} onClose={() => setOpen(false)} title={'Swap'} backgroundColor="primary">
        <div>Open Drawer</div>
      </Drawer>
    </div>
  );
};

export const Simple = TemplateSimpleDrawer.bind({});
