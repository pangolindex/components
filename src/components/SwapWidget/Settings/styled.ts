import styled from 'styled-components';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';

export const SettingsText = styled(Text)`
  font-size: 16px;
  color: ${({ theme }) => theme.text1};

  &: hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const Frame = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 10px;
`;

export const InputOptions = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

export const WarningButton = styled(Button)`
  background-color: ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.text1};
`;

export const Close = styled(Button)`
  position: absolute;
  top: 15px;
  right: 15px;
  color: ${({ theme }) => theme.text1};
  width: 30px;
  height: 30px;
`;
