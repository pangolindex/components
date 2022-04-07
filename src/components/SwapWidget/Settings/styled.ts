import styled from 'styled-components';
import { Box } from 'src/components/Box';
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
  display: grid;
  height: 100%;
  padding-left: 20px;
  padding-right: 20px;
`;

export const InputOptions = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;
