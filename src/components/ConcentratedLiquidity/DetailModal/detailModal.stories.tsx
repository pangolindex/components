import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import { Button } from 'src';
import { DetailModalProps } from './types';
import DetailModal from '.';

export default {
  component: DetailModal,
  title: 'DeFi Primitives/ConcentratedLiquidity/DetailModal/Default',
  parameters: {
    docs: {
      description: {
        component: 'Detail Modal',
      },
    },
  },
  argTypes: {
    currency0: {
      name: 'Currency 0',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Currency',
    },
    currency1: {
      name: 'Currency 1',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Currency',
    },
    isOpen: {
      name: 'Is Open',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'The state of the modal',
    },
    onClose: {
      name: 'On Close',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user close the modal',
    },
  },
};

const currency0 = new Token(ChainId.AVALANCHE, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin');
const currency1 = new Token(
  ChainId.AVALANCHE,
  CHAINS[ChainId.AVALANCHE].contracts!.png,
  18,
  CHAINS[ChainId.AVALANCHE].png_symbol!,
  'Pangolin',
);

const TemplateDetailModal: ComponentStory<typeof DetailModal> = (args: any) => {
  const [isDetailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  const handleDetailModalClose = useCallback(() => {
    setDetailModalOpen(false);
  }, [setDetailModalOpen]);

  return (
    <div style={{ paddingRight: 20 }}>
      <Button variant="primary" onClick={() => setDetailModalOpen(true)}>
        {'Detail Modal'}
      </Button>

      <DetailModal {...args} isOpen={isDetailModalOpen} onClose={handleDetailModalClose} />
    </div>
  );
};

export const Default = TemplateDetailModal.bind({});
Default.args = {
  currency0,
  currency1,
  isOpen: true,
  onClose: () => {},
} as Partial<DetailModalProps>;
