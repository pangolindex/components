import { ComponentStory } from '@storybook/react';
import React from 'react';
import { CountdownCounterProps } from './types';
import { CountdownCounter } from '.';

export default {
  component: CountdownCounter,
  title: 'DeFi Helpers/CountdownCounter',
  parameters: {
    docs: {
      description: {
        component:
          'It shows a countdown counter.  Uses [react-circular-progressbar](https://www.npmjs.com/package/react-circular-progressbar) under the hood.',
      },
    },
  },
  argTypes: {
    value: {
      name: 'Value',
      control: 'number',
      type: { name: 'number', required: true },
      description: 'Starting point of the countdown',
    },
    maxValue: {
      name: 'Max value',
      control: 'number',
      type: { name: 'number', required: true },
      description: 'Max value of the countdown',
    },
    minValue: {
      name: 'Min value',
      control: 'number',
      type: { name: 'number', required: true },
      description: 'Min value of the countdown',
    },
    text: {
      name: 'Text',
      control: 'text',
      defaultValue: '',
      type: { name: 'string', required: false },
      description: 'Text to show in the center of the counter',
    },
    strokeWidth: {
      name: 'Stroke width',
      control: 'number',
      defaultValue: 8,
      type: { name: 'number', required: false },
      description: 'Width of circular line relative to total width of component, a value from 0-100',
    },
    background: {
      name: 'Background',
      control: 'boolean',
      defaultValue: false,
      type: { name: 'boolean', required: false },
      description: 'Whether to display background color.',
    },
    backgroundPadding: {
      name: 'Background padding',
      control: 'number',
      defaultValue: 0,
      type: { name: 'number', required: false },
      description:
        'Padding between background circle and path/trail relative to total width of component. Only used if background is true.',
    },
    counterClockwise: {
      name: 'Counter clockwise',
      control: 'boolean',
      defaultValue: false,
      type: { name: 'boolean', required: false },
      description: 'Whether to rotate progressbar in counterclockwise direction',
    },
    circleRatio: {
      name: 'Circle ratio',
      control: 'number',
      defaultValue: 1,
      type: { name: 'number', required: false },
      description: 'Number from 0-1 representing ratio of the full circle diameter the progressbar should use.',
    },
    onFinish: {
      name: 'OnFinish',
      control: 'function',
      type: { name: 'function', required: false },
      description: 'Callback function to be called when countdown finishes',
    },
  },
};

const TemplateCountdownCounter: ComponentStory<typeof CountdownCounter> = (args: any) => (
  <div style={{ width: 50 }}>
    <CountdownCounter {...args} />
  </div>
);

export const Default = TemplateCountdownCounter.bind({});
Default.args = {
  value: 60,
  minValue: 0,
  maxValue: 60,
  text: '',
  strokeWidth: undefined,
  background: undefined,
  backgroundPadding: undefined,
  counterClockwise: false,
  circleRatio: undefined,
  onFinish: () => {},
} as Partial<CountdownCounterProps>;
