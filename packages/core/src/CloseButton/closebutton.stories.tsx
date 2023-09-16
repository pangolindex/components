import { ComponentStory } from '@storybook/react';
import React from 'react';
import CloseButton from '.';

export default {
  component: CloseButton,
  title: 'Building Blocks/CloseButton',
  argTypes: {
    onClick: {
      name: 'onClick',
      control: 'function',
      description: 'It triggers when click on button',
      table: {
        category: 'Events',
        type: {
          name: 'function',
          required: false,
          summary: 'function',
          detail: '() => void',
        },
      },
    },
    size: {
      name: 'size',
      control: 'text',
      description: 'Size of button',
      defaultValue: '24',
      table: {
        category: 'Sizes',
        type: {
          name: 'text',
          require: false,
          summary: 'string | number',
          detail: '24px, 24',
        },
        defaultValue: {
          summary: '24',
          detail: 'If is no provided, will use 24px to size',
        },
      },
    },
    color: {
      name: 'color',
      control: 'color',
      description: 'The middle middle (the ✕)',
      table: {
        category: 'Colors',
        type: {
          name: 'text',
          require: false,
          summary: 'string',
          detail: '#FFF, rgba(0, 0, 0, 0)',
        },
        defaultValue: {
          summary: 'theme.primary',
          detail: 'If is not provided, will use theme primary color',
        },
      },
    },
    backgroundColor: {
      name: 'backgroundColor',
      control: 'color',
      description: 'The background color',
      table: {
        category: 'Colors',
        type: {
          name: 'text',
          require: false,
          summary: 'string',
          detail: '#FFF, rgba(0, 0, 0, 0)',
        },
        defaultValue: {
          summary: 'theme.color5',
          detail: 'If is not provided, will use theme color5',
        },
      },
    },
    borderRadius: {
      name: 'borderRadius',
      control: 'text',
      description: 'The background color',
      table: {
        category: 'CSS',
        type: {
          name: 'text',
          require: false,
          summary: 'string | number',
          detail: '24px, 24',
        },
        defaultValue: {
          summary: '50%',
          detail: 'If is not provided, will use 50%',
        },
      },
    },
    padding: {
      name: 'padding',
      control: 'text',
      description: 'The CSS padding',
      table: {
        category: 'CSS',
        type: {
          name: 'text',
          require: false,
          summary: 'string | number',
          detail: '24px, 24',
        },
        defaultValue: {
          summary: '5px',
          detail: 'If is not provided, will use 5px',
        },
      },
    },
  },
};

const TemplateCloseButton: ComponentStory<typeof CloseButton> = (args: any) => <CloseButton {...args} />;

function onClick() {
  alert('Click');
}

export const Default = TemplateCloseButton.bind({});
Default.args = {
  onClick: onClick,
};

export const Custom = TemplateCloseButton.bind({});
Custom.args = {
  onClick: onClick,
  size: 48,
  color: '#FFF',
  backgroundColor: '#000',
  borderRadius: '12px',
  padding: '0px',
};
