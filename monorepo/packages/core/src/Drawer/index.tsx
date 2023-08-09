import React, { useContext } from 'react';
import { X } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, Text } from '../';
import { CloseCircle, DrawerContent, DrawerRoot } from './styled';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  pb?: number;
  pt?: number;
  px?: number;
  backgroundColor?: string;
}

export default function Drawer({ isOpen, onClose, children, title, pb, px, pt, backgroundColor }: DrawerProps) {
  const theme = useContext(ThemeContext);
  return (
    <DrawerRoot isOpen={isOpen} backgroundColor={backgroundColor}>
      {title && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pb={pb || 20}
          pt={pt || 20}
          px={px || 20}
        >
          <Text color="drawer.text" fontSize={21} fontWeight={800}>
            {title}
          </Text>
        </Box>
      )}

      <Box position="absolute" right={px || 20} top={pt || 20}>
        <CloseCircle onClick={onClose}>
          <X color={theme.mustardYellow} size={10} />
        </CloseCircle>
      </Box>

      <DrawerContent>{children}</DrawerContent>
    </DrawerRoot>
  );
}
