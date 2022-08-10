import styled from 'styled-components';
import { Box } from 'src/components/Box';
import { Text } from 'src/components/Text';

export const Root = styled(Box)`
  width: 100%;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
  grid-gap: 16px;
`;

export const ToolTipText = styled(Text)`
  position: relative;
  :hover .tooltip {
    visibility: visible;
  }

  .tooltip {
    visibility: hidden;
    width: max-content;
    background-color: ${({ theme }) => theme.primary1};
    color: black;
    text-align: center;
    border-radius: 6px;
    padding: 10px;
    position: absolute;
    z-index: 1;
    bottom: 150%;
    font-size: 12px;
    font-weight: 500;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
  }

  .tooltip::after {
    content: ' ';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${({ theme }) => theme.primary1} transparent transparent transparent;
  }
`;
