import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { SelectPairProps } from './types';
import SelectPair from '.';

export default {
  component: SelectPair,
  title: 'DeFi Primitives/Elixir/AddLiquidity/SelectPair',
  parameters: {
    docs: {
      description: {
        component: 'Select Pair',
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
    onChangeTokenDrawerStatus: {
      name: 'On Change Token Drawer Status',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'Callback to open Token Drawer',
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

const TemplateSelectPair: ComponentStory<typeof SelectPair> = (args: any) => {
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const onChangeStatus = useCallback(() => {
    setIsCurrencyDrawerOpen(!isCurrencyDrawerOpen);
  }, [isCurrencyDrawerOpen]);

  return (
    <div style={{ paddingRight: 20 }}>
      {isCurrencyDrawerOpen && (
        <SelectTokenDrawer
          isOpen={isCurrencyDrawerOpen}
          onClose={() => {
            onChangeStatus();
          }}
          onCurrencySelect={() => {}}
        />
      )}
      <SelectPair
        {...args}
        onChangeTokenDrawerStatus={() => {
          onChangeStatus();
        }}
      />
    </div>
  );
};

export const Default = TemplateSelectPair.bind({});
Default.args = {
  currency0,
  currency1,
  onChangeTokenDrawerStatus: () => {},
} as Partial<SelectPairProps>;
