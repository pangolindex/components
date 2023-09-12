import { Button } from '@honeycomb/core';
import { usePangolinWeb3 } from '@honeycomb/shared';
import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import Docs from './docs.md';
import { argTypes } from './storiesConstants';
import WalletModal from '.';

export default {
  component: WalletModal,
  title: 'DeFi Helpers/WalletModal',
  argTypes: argTypes,
  parameters: {
    docs: {
      description: {
        component: Docs,
      },
    },
  },
};

const TemplateWalletModal: ComponentStory<typeof WalletModal> = (args: any) => {
  const [open, setOpen] = useState<boolean>(args.open);
  const { account } = usePangolinWeb3();

  return (
    <div style={{ padding: 20 }}>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {account ? `Wallet connected: ${account}` : 'Connect Wallet'}
      </Button>
      <WalletModal
        open={open}
        closeModal={() => {
          setOpen(false);
        }}
        onWalletConnect={() => {
          setOpen(false);
        }}
        initialChainId={args.initialChainId}
      />
    </div>
  );
};

export const Default = TemplateWalletModal.bind({});
