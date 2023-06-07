import React from 'react';
import { Box, Text, Drawer } from '@pangolindex/core';
import { Divider } from './styled';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RetryDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Drawer title="Re-tries" isOpen={isOpen} onClose={onClose}>
      <Box>
        <Text color="swapWidget.secondary" fontSize={16} fontWeight={500} marginLeft={10}>
          1
        </Text>
        <Divider />
      </Box>
    </Drawer>
  );
};
export default RetryDrawer;
