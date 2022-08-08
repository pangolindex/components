import React from 'react';
import ReactPaginate from 'react-paginate';
import styled from 'styled-components';

export const Paginate = styled(ReactPaginate)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  list-style-type: none;
  padding: 0 5rem;

  li a {
    border-radius: 7px;
    padding: 0.1rem 1rem;
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }

  li.previous a,
  li.next a,
  li.break a {
    border-color: transparent;
  }

  li.active a {
    background-color: ${({ theme }) => theme.primary};
    border-color: transparent;
    color: black;
    min-width: 32px;
  }

  li.disabled a {
    color: ${({ theme }) => theme.button?.disable?.background};
    cursor: default;
  }
`;
