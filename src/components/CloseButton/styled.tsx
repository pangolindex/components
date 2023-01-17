import React from 'react';
import { X } from 'react-feather';
import styled from 'styled-components';
import { Button } from '../Button';

export const StyledButton = styled((props) => (
  <Button variant="plain" {...props}>
    {props.children}
  </Button>
))<{
  backgroundColor?: string;
  borderRadius?: string | number;
  padding?: string | number;
}>`
  background-color: ${({ theme, backgroundColor }) => (backgroundColor ? backgroundColor : theme.color5)};
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '50%')};
  padding: ${({ padding }) => (padding ? padding : '5px')};
`;

export const CloseIcon = styled(X)<{ color?: string }>`
  color: ${({ theme, color }) => (color ? color : theme.primary)};
`;
