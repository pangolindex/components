import { ComponentStory } from '@storybook/react';
import React from 'react';
import { TooltipProps } from 'react-tooltip';
import { Box } from '../Box';
import Tooltip from '.';

export default {
  component: Tooltip,
  title: 'Building Blocks/Tooltip',
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip component for displaying information on hover. Uses [react-tooltip](https://www.npmjs.com/package/react-tooltip) under the hood.',
      },
    },
  },
  argTypes: {
    wrapper: {
      control: 'select',
      type: { name: 'string', required: false },
      options: ['div', 'span'],
      defaultValue: `div`,
      description: 'Selecting the wrapper element of the react tooltip',
    },
    type: {
      control: 'select',
      type: { name: 'string', required: false },
      options: ['dark', 'light', 'error', 'success', 'warning', 'info'],
      defaultValue: 'dark',
      description: 'Theme',
    },
    place: {
      control: 'select',
      type: { name: 'string', required: false },
      options: ['top', 'bottom', 'left', 'right', ''],
      defaultValue: '',
      description: 'Placement',
    },
    effect: {
      control: 'select',
      type: { name: 'string', required: false },
      options: ['float', 'solid'],
      defaultValue: 'float',
      description: 'behaviour of tooltip',
    },
    multiline: {
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: false,
      description: 'support `<br>`, `<br />` to make multiline',
    },
    className: {
      name: 'HTML Enabled',
      control: 'text',
      type: { name: 'string', required: false },
      defaultValue: '',
      description: `classextra custom class, can use !important to overwrite tooltip's default class`,
    },
    html: {
      name: 'HTML Enabled',
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: false,
      description:
        '`<p data-tip="<p>HTML tooltip</p>" data-html={true}></p>` or `<Tooltip html={true} />`, but see Security Note below.',
    },
    delayHide: {
      name: 'Delay Hide',
      control: 'number',
      type: { name: 'number', required: false },
      defaultValue: 0,
      description: '`<p data-tip="tooltip" data-delay-hide="1000"></p>` or `<Tooltip delayHide={1000} />`',
    },
    delayShow: {
      name: 'Delay Show',
      control: 'number',
      type: { name: 'number', required: false },
      defaultValue: 0,
      description: '`<p data-tip="tooltip" data-delay-show="1000"></p>` or `<Tooltip delayShow={1000} />`',
    },
    delayUpdate: {
      name: 'Delay Update',
      control: 'number',
      type: { name: 'number', required: false },
      defaultValue: 0,
      description:
        '`<p data-tip="tooltip" data-delay-update="1000"></p>` or `<Tooltip delayUpdate={1000} />` Sets a delay in calling getContent if the tooltip is already shown and you scroll over another target',
    },
    textColor: {
      name: 'Text Color',
      control: 'color',
      type: { name: 'string', required: false },
      defaultValue: '',
      description: 'Popup text color',
    },
    backgroundColor: {
      name: 'Background Color',
      control: 'color',
      type: { name: 'string', required: false },
      defaultValue: '',
      description: 'Popup background color',
    },
    borderColor: {
      name: 'Border Color',
      control: 'color',
      type: { name: 'string', required: false },
      defaultValue: '',
      description: 'Popup border color - enabled by the `border` value',
    },
    arrowColor: {
      name: 'Arrow Color',
      control: 'color',
      type: { name: 'string', required: false },
      defaultValue: '',
      description: 'Popup arrow color - if not specified, will use the `backgroundColor` value',
    },
    getContent: {
      name: 'Get Content',
      control: 'function',
      type: { name: 'function', required: false },
      description: 'Generate the tip content dynamically',
    },
    afterShow: {
      name: 'After Show',
      control: 'function',
      type: { name: 'function', required: false },
      description: 'Function that will be called after tooltip show, with event that triggered show',
    },
    afterHide: {
      name: 'After Hide',
      control: 'function',
      type: { name: 'function', required: false },
      description: 'Function that will be called after tooltip hide, with event that triggered hide',
    },
    disable: {
      name: 'Disable',
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: false,
      description: 'Disable the tooltip behaviour',
    },
    scrollHide: {
      name: 'Scroll Hide',
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: true,
      description: 'Hide the tooltip when scrolling',
    },
    resizeHide: {
      name: 'Resize Hide',
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: true,
      description: 'Hide the tooltip when resizing the window',
    },
    clickable: {
      name: 'Clickable',
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: false,
      description: 'Enables tooltip to respond to mouse (or touch) events',
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
Default.args = {} as Partial<TooltipProps>;
