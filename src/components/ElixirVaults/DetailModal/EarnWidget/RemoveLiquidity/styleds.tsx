import styled from 'styled-components';
import { Box, Text } from 'src/components';

export const RemoveWrapper = styled(Box)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const ButtonWrapper = styled(Box)`
  justify-content: space-between;
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
`;

export const BlackWrapper = styled(Box)`
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px 30px;
  flex-direction: column;
  z-index: 999;
  position: absolute;
  align-items: center;
  pointer-events: all;
  justify-content: center;
  right: 0;
  top: 0;
  background-color: ${({ theme }) => theme.bg2};
`;

export const ErrorBox = styled(Box)`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const Link = styled(Text)`
  text-decoration: none;
`;
