import { Box, Modal, Text } from '@pangolindex/core';
import { useTranslation } from '@pangolindex/locales';
import React from 'react';
import { X } from 'react-feather';
import { Close, ModalFrame, WarningButton } from './styled';

interface Props {
  isOpen: boolean;
  close: () => void;
  setExpertMode: (value: boolean) => void;
}

const WarningModal = ({ isOpen, close, setExpertMode }: Props) => {
  const { t } = useTranslation();

  const confirmAction = () => {
    const text = prompt(t('settings.confirmExpertMode'));
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
          {t('settings.areYouSure')}
        </Text>
        <Box marginTop={20}>
          <Text color="swapWidget.primary">{t('settings.expertInfo')}</Text>
          <Text color="swapWidget.primary" fontWeight={800} fontSize={20} marginTop={20} marginBottom={40}>
            {t('settings.expertWarningCAPS')}
          </Text>
          <WarningButton variant="primary" onClick={confirmAction}>
            {t('settings.turnOnExpertMode')}
          </WarningButton>
        </Box>
      </ModalFrame>
    </Modal>
  );
};

export default WarningModal;
