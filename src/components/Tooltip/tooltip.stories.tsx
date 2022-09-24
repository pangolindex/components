import { ComponentStory } from '@storybook/react';
import React from 'react';
import { TooltipProps } from 'react-tooltip';
import { Box } from '../Box';
import Tooltip from '.';

export default {
  component: Tooltip,
  title: 'Components/Tooltip',
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip component for displaying information on hover. Uses [react-tooltip](https://www.npmjs.com/package/react-tooltip) under the hood.',
      },
    },
  },
};

const TemplateTooltip: ComponentStory<typeof Tooltip> = (args: any) => {
  return (
    <Box pt={'3rem'} pl={'3rem'}>
      <Tooltip {...args} />
      <div data-tip="test">Hover it</div>
    </Box>
  );
};

export const Default = TemplateTooltip.bind({});
Default.args = {
  type: 'light',
  effect: 'float',
  multiline: false,
  className: '',
  html: false,
  delayHide: 500,
  delayShow: 500,
  delayUpdate: 0,
  textColor: 'black',
  backgroundColor: 'white',
  borderColor: 'white',
  arrowColor: 'black',
  getContent: () => {},
  afterShow: () => {},
  afterHide: () => {},
  disable: false,
  scrollHide: true,
  resizeHide: true,
  wrapper: 'div',
  clickable: false,
} as Partial<TooltipProps>;
