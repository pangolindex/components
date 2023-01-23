import { Box } from "@components/components";
import styled from "styled-components";

export const PageWrapper = styled(Box)`
  width: 100%;
  padding: 25px;
  display: grid;
  flex-grow: 1;
  grid-gap: 16px;
  grid-template-columns: 75% 25%;
  grid-template-rows: max-content 1fr;
  grid-template-areas:
    'images stake'
    'images stake';

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 65% 35%;
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: none;
    grid-template-areas:
      'stake'
      'images';
  `};
`;
