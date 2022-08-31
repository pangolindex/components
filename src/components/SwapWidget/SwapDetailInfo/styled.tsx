import styled from 'styled-components';
import { Box, Text } from '../../';

export const ContentBox = styled(Box)`
  background-color: ${({ theme }) => theme.swapWidget?.detailsBackground};
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
`;
export const DataBox = styled(Box)`
  align-items: center;
  justify-content: space-between;
  display: flex;
  margin: 5px 0px 5px 0px;
`;
export const ValueText = styled(Text)<{ severity?: -1 | 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.error
      : severity === 2
      ? theme.warning
      : severity === 1
      ? theme.swapWidget?.secondary
      : severity === 0
      ? theme.success
      : theme.swapWidget?.secondary};
`;
