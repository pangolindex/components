import React from 'react';
import styled from 'styled-components';
import { Box } from 'src/components';

export const Currencies = styled(Box)`
  display: grid;
  grid-template-columns: 0.5fr 0.5fr;
  grid-gap: 5px;
`;

export const CurrencySelectWrapper = styled(Box)`
  width: 100%;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid transparent;
  display: flex;
  position: relative;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.color3};
  color: ${({ theme }) => theme.text4};
  cursor: pointer;
`;
