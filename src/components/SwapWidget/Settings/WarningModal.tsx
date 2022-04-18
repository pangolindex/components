import React from 'react';
import { X } from 'react-feather';
import { Box } from 'src/components/Box';
import Modal from 'src/components/Modal';
import { Text } from 'src/components/Text';
import { Close, WarningButton } from './styled';

interface Props {
  isOpen: boolean;
  close: () => void;
  setExpertMode: (value: boolean) => void;
}

const WarningModal = ({ isOpen, close, setExpertMode }: Props) => {
  const confirm_action = () => {
    const text = prompt('Please type the word "confirm" to enable expert mode.');
    if (text === 'confirm') {
      setExpertMode(true);
      close();
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={close}>
      <Box
        padding="20px"
        width="25vw"
        display="flex"
        alignItems="center"
        flexDirection="column"
        textAlign="justify"
        position="relative"
      >
        <Close variant="plain" onClick={close}>
          <X size={30} />
        </Close>
        <Text fontSize={32} fontWeight={800} color="text1">
          Are you sure?
        </Text>
        <Box marginTop={20}>
          <Text color="text1">
            Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result in
            bad rates and lost funds.
          </Text>
          <Text color="text1" fontWeight={800} fontSize={24} marginTop={20} marginBottom={40}>
            ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
          </Text>
          <WarningButton variant="primary" onClick={confirm_action}>
            Turn on expert mode
          </WarningButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default WarningModal;
