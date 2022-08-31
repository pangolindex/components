import React from 'react';
import { X } from 'react-feather';
import { Box } from 'src/components/Box';
import Modal from 'src/components/Modal';
import { Text } from 'src/components/Text';
import { Close, ModalFrame, WarningButton } from './styled';

interface Props {
  isOpen: boolean;
  close: () => void;
  setExpertMode: (value: boolean) => void;
}

const WarningModal = ({ isOpen, close, setExpertMode }: Props) => {
  const confirmAction = () => {
    const text = prompt('Please type the word "confirm" to enable expert mode.');
    if (text === 'confirm') {
      setExpertMode(true);
      close();
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={close}>
      <ModalFrame>
        <Close variant="plain" onClick={close}>
          <X size={28} />
        </Close>
        <Text fontSize={28} fontWeight={800} color="swapWidget.primary">
          Are you sure?
        </Text>
        <Box marginTop={20}>
          <Text color="swapWidget.primary">
            Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result in
            bad rates and lost funds.
          </Text>
          <Text color="swapWidget.primary" fontWeight={800} fontSize={20} marginTop={20} marginBottom={40}>
            ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
          </Text>
          <WarningButton variant="primary" onClick={confirmAction}>
            Turn on expert mode
          </WarningButton>
        </Box>
      </ModalFrame>
    </Modal>
  );
};

export default WarningModal;
