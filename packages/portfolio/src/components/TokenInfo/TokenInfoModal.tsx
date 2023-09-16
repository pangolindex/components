import { Box, CloseButton, Modal } from '@honeycomb-finance/core';
import React from 'react';
import TokenInfo from './TokenInfo';
import { TokenInfoModalProps } from './types';

export default function TokenInfoModal({ open, closeModal, ...rest }: TokenInfoModalProps) {
  return (
    <Modal isOpen={open} onDismiss={closeModal}>
      <Box width="420px" position="relative">
        <TokenInfo {...rest} />
        <Box position="absolute" right="20px" top="15px">
          <CloseButton onClick={closeModal} size={16} />
        </Box>
      </Box>
    </Modal>
  );
}
