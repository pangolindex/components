import React from 'react';
import { CloseIcon, StyledButton } from './styled';
import { ComponentProps } from './types';

export default function CloseButton({
  padding,
  backgroundColor,
  borderRadius,
  color,
  onClick,
  size = 24,
}: ComponentProps) {
  return (
    <StyledButton
      onClick={onClick}
      height={size}
      width={size}
      padding={padding}
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
    >
      <CloseIcon size={size} color={color} />
    </StyledButton>
  );
}
