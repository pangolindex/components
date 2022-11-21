import { ComponentStory } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import { Button } from '../../Button';
import AddLiquidityModal from '.';

export default {
  component: AddLiquidityModal,
  title: 'Components/Pool/AddLiquidityModal',
};

const SampleAddLiquidity: ComponentStory<typeof AddLiquidityModal> = () => {
  const [isAddLiquidityModalOpen, setAddLiquidityModalOpen] = useState<boolean>(false);

  const handleAddLiquidityModalClose = useCallback(() => {
    setAddLiquidityModalOpen(false);
  }, [setAddLiquidityModalOpen]);

  return (
    <div style={{ padding: 20 }}>
      <Button variant="primary" onClick={() => setAddLiquidityModalOpen(true)}>
        {'Create a Pair'}
      </Button>

      <AddLiquidityModal isOpen={isAddLiquidityModalOpen} onClose={handleAddLiquidityModalClose} />
    </div>
  );
};

export const AddLiquidity = SampleAddLiquidity.bind({});
