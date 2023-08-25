import { Box } from '@pangolindex/core';
import styled from 'styled-components';

export const HeaderRoot = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.text8 + '33'};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    border-bottom: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  `};
`;

export const StatsWrapper = styled(Box)<{ colNumber: number }>`
  display: grid;
  grid-template-columns: repeat(${({ colNumber }) => colNumber}, auto);
  grid-gap: 20px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    grid-gap: 10px;
    margin-top: 10px;
    grid-template-columns: 50% 50%;
`};
`;

export const HeaderWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%
  `};
`;
