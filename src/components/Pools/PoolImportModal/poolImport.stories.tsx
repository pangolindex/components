import { ComponentStory } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import { Button } from '../../Button';
import PoolImportModal from '.';

export default {
  component: PoolImportModal,
  title: 'Components/Pool/PoolImportModal',
};

const SamplePoolImport: ComponentStory<typeof PoolImportModal> = () => {
  const [isPoolImportModalOpen, setIsPoolImportModalOpen] = useState(false);

  const handlePoolImportModalClose = useCallback(() => {
    setIsPoolImportModalOpen(false);
  }, [setIsPoolImportModalOpen]);

  return (
    <div style={{ padding: 20 }}>
      <Button variant="primary" onClick={() => setIsPoolImportModalOpen(true)}>
        {'Pool Import'}
      </Button>

      <PoolImportModal
        isOpen={isPoolImportModalOpen}
        onClose={handlePoolImportModalClose}
        onManagePoolsClick={() => {
          setIsPoolImportModalOpen(false);
        }}
      />
    </div>
  );
};

export const PoolImport = SamplePoolImport.bind({});
