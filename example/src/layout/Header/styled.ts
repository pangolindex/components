import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 2;
`;

export const MenuLink = styled(Link)`
  ${({ theme }) => theme.flexRowNoWrap}
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.color4};
  font-size: 1rem;
  width: fit-content;
  padding: 0 16px;
  margin: 0px;
  align-items: center;
  font-weight: 500;
  width: 100%;
`;

export const Menuwrapper = styled.div`
  display: flex;
  width: fit-content;
  padding: 0 16px;
`;
