import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { Box, Text } from '../';
import { CloseIcon, DrawerContent, DrawerRoot } from './styled';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  widgetBackground?: string;
  backgroundColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  children,
  title,
  backgroundColor,
  widgetBackground,
  textPrimaryColor,
  textSecondaryColor,
}: DrawerProps) {
  const theme = useContext(ThemeContext);
  return (
    <DrawerRoot
      isOpen={isOpen}
      backgroundColor={backgroundColor}
      style={widgetBackground ? { backgroundColor: widgetBackground } : {}}
    >
      {title && (
        <Box display="flex" justifyContent="space-between" alignItems="center" padding="10px">
          <Text color="text1" fontSize={24} style={textPrimaryColor ? { color: textPrimaryColor } : {}}>
            {title}
          </Text>
        </Box>
      )}

      <Box position="absolute" right={10} top={10}>
        <CloseIcon
          onClick={onClose}
          color={theme.text4}
          style={textSecondaryColor ? { stroke: textSecondaryColor } : {}}
        />
      </Box>

      <DrawerContent>{children}</DrawerContent>
    </DrawerRoot>
  );
}
