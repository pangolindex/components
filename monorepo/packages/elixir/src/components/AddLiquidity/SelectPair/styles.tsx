import { Box } from '@honeycomb/core';
import React from 'react';
import styled from 'styled-components';

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

export const ArrowWrapper = styled.div`
  background-color: ${({ theme }) => theme.color13};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;
