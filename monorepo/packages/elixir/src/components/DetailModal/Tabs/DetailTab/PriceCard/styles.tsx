import { Text } from '@pangolindex/core';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 25px 30px;
  row-gap: 8px;
  background-color: ${({ theme }) => theme?.elixir?.primaryBgColor};
`;

export const Description = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
      display: none;
  `};
`;
