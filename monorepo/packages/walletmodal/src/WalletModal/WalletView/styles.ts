import styled from 'styled-components';
import { Box, Button, CircleLoader, Logo } from '@pangolindex/core';

export const Wrapper = styled(Box)`
  display: grid;
  padding: 10px;
  gap: 30px;
`;

export const Frame = styled(Box)`
  display: grid;
  gap: 10px;
  align-content: center;
  justify-items: center;
  width: 100%;
  padding: 20px;
`;

export const BackButton = styled(Button)`
  border-radius: 50%;
  background-color: ${({ theme }) => theme.color5};
  width: max-content;
  height: max-content;
  padding: 5px;
`;

export const StyledLogo = styled(Logo)`
  height: 80px;
  width: 80px;
`;

export const Link = styled.a`
  display: flex;
  align-items: center;
  margin-top: 20px;
  text-decoration: none;

  &:hover {
    text-decoration: underline ${({ theme }) => theme.text1};
  }
`;

export const Loader = styled(CircleLoader)`
  margin-right: 1rem;
`;

export const ErrorButton = styled(Button)`
  border: solid 1px ${({ theme }) => theme.red1};
  display: flex;
  align-items: center;
  height: max-content;
  width: max-content;
  padding: 10px;
  margin-top: 20px;

  &:hover {
    opacity: 0.8;
  }
`;

export const QRCodeBox = styled(Box)`
  border-radius: 4px;
  background-color: ${({ theme }) => theme.white};
  padding: 10px;
`;
