import React, { useContext } from 'react';
import { X } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, Text } from '../';
import { CloseCircle, DrawerContent, DrawerRoot } from './styled';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  backgroundColor?: string;
}

export default function Drawer({ isOpen, onClose, children, title, backgroundColor }: DrawerProps) {
  const theme = useContext(ThemeContext);
  return (
    <DrawerRoot isOpen={isOpen} backgroundColor={backgroundColor}>
      {title && (
        <Box display="flex" justifyContent="space-between" alignItems="center" padding="20px">
          <Text color="text1" fontSize={21} fontWeight={800}>
            {title}
          </Text>
        </Box>
      )}

      <Box position="absolute" right={20} top={20}>
        <CloseCircle onClick={onClose}>
          <X color={theme.primary} size={10} />
        </CloseCircle>
      </Box>

      <DrawerContent>{children}</DrawerContent>
    </DrawerRoot>
  );
}
