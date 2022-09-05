import styled from 'styled-components';
import { Box, Text } from 'src/components';

export const Root = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
`;

export const Header = styled(Box)`
  padding: 0px 20px;
`;

export const OutputText = styled(Text)`
  width: 100%;
  line-height: 18px;
  text-align: left;
  color: ${({ theme }) => theme.color11};
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

export const StatWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 33%) minmax(auto, 33%) minmax(auto, 33%);
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: minmax(auto, 50%) minmax(auto, 50%);
  `};
  grid-gap: 12px;
`;
