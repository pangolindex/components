import styled from 'styled-components';
import { Box } from 'src/components';

export const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  padding: 30px;
`;

export const Information = styled(Box)`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
`;

export const StateContainer = styled.div<{ colNumber: number }>`
  grid-template-columns: repeat(${({ colNumber }) => colNumber}, auto);
  gap: 12px;
  display: grid;
  width: 100%;
  align-items: start;
  margin-top: 12px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  ${({ theme, colNumber }) => theme.mediaWidth.upToSmall`
    grid-template-columns: repeat(${colNumber}, minmax(100px, 1fr));
    grid-column-gap: 6px;
    grid-row-gap:6px;
  `};
`;
