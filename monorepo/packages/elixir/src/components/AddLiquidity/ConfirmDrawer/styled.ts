import { Box } from '@honeycomb/core';
import styled from 'styled-components';

export const Root = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
`;

export const Header = styled(Box)`
  padding: 0px 20px;
`;

export const Footer = styled(Box)`
  padding: 0px 10px;
`;

export const ErrorWrapper = styled(Box)`
  display: grid;
  grid-template-rows: minmax(100px, auto) max-content;
  height: 100%;
  padding: 10px;
`;

export const ErrorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const StateContainer = styled.div`
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  display: grid;
  width: 100%;
  align-items: start;
  margin-top: 20px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    grid-column-gap: 6px;
    grid-row-gap:6px;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
  `};
`;
