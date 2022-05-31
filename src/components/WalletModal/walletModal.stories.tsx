import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { usePangolinWeb3 } from 'src/hooks';
import { Button } from '../Button';
import WalletModal from '.';

export default {
  component: WalletModal,
  title: 'Components/WalletModal',
};

const SampleWallet: ComponentStory<typeof WalletModal> = () => {
  const [open, setOpen] = useState<boolean>(true);
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
      />
    </div>
  );
};

export const Wallet = SampleWallet.bind({});
