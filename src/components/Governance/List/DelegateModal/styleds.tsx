import { X } from 'react-feather';
import styled from 'styled-components';
import { Box } from 'src/components';
import { AutoColumn } from 'src/components/Column';

export const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`;

export const StyledClosed = styled(X)`
  :hover {
    cursor: pointer;
  }
`;

export const TextButton = styled.div`
  :hover {
    cursor: pointer;
  }
`;

export const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center
  justify-content: space-between;
`;
