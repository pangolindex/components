import { Button } from '@honeycomb-finance/core';
import { PNG } from '@honeycomb-finance/shared';
import { ChainId } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import TokenInfoModal from './TokenInfoModal';
import { argTypes, circulationSupply, customToken, totalSupply, unclaimedAmount } from './storiesConstants';

export default {
  component: TokenInfoModal,
  title: 'Defi Helpers/TokenInfoModal',
  argTypes: {
    ...argTypes,
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

const TemplateTokenInfo: ComponentStory<typeof TokenInfoModal> = (args: any) => {
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
      <TokenInfoModal open={open} closeModal={closeModal} {...args} />
    </div>
  );
};

export const Default = TemplateTokenInfo.bind({});
Default.args = {
  token: PNG[ChainId.AVALANCHE],
};

export const Custom = TemplateTokenInfo.bind({});
Custom.args = {
  token: customToken,
  totalSupply,
  circulationSupply,
  unclaimedAmount,
  animatedLogo: true,
  logo: 'https://raw.githubusercontent.com/pangolindex/assets/main/subDAO_logos/PNG/COINLOGO-AVALANCHE.png',
};
