import { Button } from '@honeycomb/core';
import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import Docs from './docs.md';
import NetworkSelection from '.';

export default {
  component: NetworkSelection,
  title: 'DeFi Helpers/NetworkSelection',
  parameters: {
    docs: {
      description: {
        component: Docs,
      },
    },
  },
  argTypes: {
    onToogleWalletModal: {
      name: 'onToogleWalletModal',
      control: 'function',
      description:
        "Function that will be executed when the active connector/wallet doesn't support the destination chain",
      type: {
        required: true,
      },
      table: {
        category: 'Others',
        type: {
          name: 'function',
          summary: 'function',
          detail: '() => void',
        },
      },
    },
    open: {
      name: 'open',
      control: 'boolean',
      description: 'If the modal is open',
      type: {
        required: true,
      },
      table: {
        category: 'Modal',
        type: {
          name: 'boolean',
          summary: 'boolean',
        },
      },
    },
    closeModal: {
      name: 'closeModal',
      control: 'function',
      description: 'Function to close the modal',
      type: {
        required: true,
      },
      table: {
        category: 'Modal',
        type: {
          name: 'function',
          summary: 'function',
          detail: '() => void',
        },
      },
    },
  },
};

const TemplateNetworkSelection: ComponentStory<typeof NetworkSelection> = (args: any) => {
  const [open, setOpen] = useState(args.open);

  function closeModal() {
    setOpen(false);
  }

  function openModal() {
    setOpen(true);
  }

  return (
    <div style={{ width: '100px', boxSizing: 'border-box' }}>
      <Button variant="primary" onClick={openModal}>
        Open
      </Button>
      <NetworkSelection open={open} closeModal={closeModal} {...args} />
    </div>
  );
};

export const Default = TemplateNetworkSelection.bind({});
