import React, { useCallback, useRef } from 'react';
import { Portal } from 'react-portal';
import styled from 'styled-components';
import { useEscapeKey } from 'src/hooks/useEscapeKey';
import { useOnClickOutside } from 'src/hooks/useOnClickOutside';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled.div<{ background?: string; isOpen: boolean }>`
  z-index: 999;
  background-color: transparent;
  overflow: hidden;
  display: ${({ isOpen }) => (!isOpen ? 'none' : 'flex')};
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  background-color: ${({ theme, background }) => (background ? background : theme.modalBG)};
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Container = styled.div`
  background: ${({ theme }) => theme.bg8};
  border-radius: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 0px;
    width: 100%;
    height: 100%;
  `};
`;

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  children?: React.ReactNode;
  overlayBG?: string;
  closeOnClickOutside?: boolean;
}

export default function Modal({ isOpen, onDismiss, children, overlayBG, closeOnClickOutside = true }: ModalProps) {
  const node = useRef<HTMLDivElement>();
  const handleClose = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useOnClickOutside(node, isOpen && closeOnClickOutside ? handleClose : undefined);

  useEscapeKey(node, isOpen ? handleClose : undefined);

  return (
    <Portal>
      <StyledDialogOverlay isOpen={isOpen} background={overlayBG}>
        {isOpen && <Container ref={node as any}>{children}</Container>}
      </StyledDialogOverlay>
    </Portal>
  );
}
