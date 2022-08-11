import React from 'react';
import styled from 'styled-components';
import { Box } from '../Box';

export const Root = styled(Box)`
  display: flex;
  width: 100%;
  height: 100%;
`;

export const Filters = styled(Box)`
  display: inline-grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
`;

export const Frame = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  flex-grow: 1;
  grid-gap: 16px;
`;

export const StyledSVG = styled(Box)`
  svg {
    width: 100%;
    height: auto;
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(35, 35, 35);
  opacity: 0.8;
  display: none;
  z-index: 99;
`;
