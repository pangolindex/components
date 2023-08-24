import { Button } from '@pangolindex/core';
import { ComponentStory } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import { AddLiquidityProps } from './types';
import AddLiquidity from '.';

export default {
  component: AddLiquidity,
  title: 'DeFi Primitives/Elixir/AddLiquidity/Default',
  parameters: {
    docs: {
      description: {
        component: 'Add Liquidity',
      },
    },
  },
  argTypes: {
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

const TemplateAddLiquidity: ComponentStory<typeof AddLiquidity> = (args: any) => {
  const [isAddLiquidityOpen, setAddLiquidityOpen] = useState<boolean>(false);

  const handleAddLiquidityClose = useCallback(() => {
    setAddLiquidityOpen(false);
  }, [setAddLiquidityOpen]);

  return (
    <div style={{ paddingRight: 20 }}>
      <Button variant="primary" onClick={() => setAddLiquidityOpen(true)}>
        {'Add Liquidity'}
      </Button>

      <AddLiquidity {...args} isOpen={isAddLiquidityOpen} onClose={handleAddLiquidityClose} />
    </div>
  );
};

export const Default = TemplateAddLiquidity.bind({});
Default.args = {
  isOpen: true,
  onClose: () => {},
} as Partial<AddLiquidityProps>;
