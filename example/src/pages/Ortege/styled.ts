import styled from 'styled-components';
import { Box } from '@components/index';

export const PageWrapper = styled(Box)`
  display: flex;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  `};
`;
