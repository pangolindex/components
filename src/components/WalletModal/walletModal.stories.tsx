import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import WalletModal from '.';

export default {
  component: WalletModal,
  title: 'Pangolin/WalletModal',
};

const SampleWallet: ComponentStory<typeof WalletModal> = () => {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <div style={{ background: '#000', padding: 50 }}>
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
