import { Box } from '@honeycomb-finance/core';
import React from 'react';
import styled from 'styled-components';

export const Currencies = styled(Box)`
  display: grid;
  grid-template-columns: 0.5fr 0.5fr;
  grid-gap: 5px;
  padding-bottom: 20px;

  & > * {
    overflow: hidden;
  }
`;
