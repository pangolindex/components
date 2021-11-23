import { lighten } from 'polished';
import styled, { css } from 'styled-components';
import { ButtonProps } from './types';

const Primary = (props: ButtonProps) =>
  props.variant === 'primary' &&
  css`
    background-color: ${({ theme }) => theme.primary1};
    color: white;
  `;

const Secondary = (props: ButtonProps) =>
  props.variant === 'secondary' &&
  css`
    background-color: ${({ theme }) => theme.primary4};
    color: ${({ theme }) => theme.primary1};
  `;

const Outline = (props: ButtonProps) =>
  props.variant === 'outline' &&
  css`
    border: 1px solid ${({ theme }) => theme.primary1};
    background-color: transparent;
    color: ${({ theme }) => theme.text1};
  `;

const Plain = (props: ButtonProps) =>
  props.variant === 'plain' &&
  css`
    background-color: transparent;
    color: ${({ theme }) => theme.primary1};
    display: flex;
    justify-content: center;
    align-items: center;
  `;

const Disable = (props: ButtonProps) =>
  (props.isDisabled || props.loading) &&
  css`
    background-color: ${({ theme }) => theme.bg4};
    color: ${({ theme }) => theme.text3};
  `;

const Confirmed = (props: ButtonProps) =>
  props.variant === 'confirm' &&
  css`
    background-color: ${({ theme }) => lighten(0.5, theme.green1)};
    color: ${({ theme }) => theme.green1};
    border: 1px solid ${({ theme }) => theme.green1};
    opacity: 50%;
    cursor: auto;
  `;

export const Root = styled.button<ButtonProps>`
  padding: ${(props) => (props?.padding ? props?.padding : '18px')};
  width: ${({ width }) => (width ? width : '100%')};
  font-weight: 500;
  text-align: center;
  border-radius: 10px;
  border-radius: ${(props) => props?.borderRadius && props?.borderRadius};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: ${(props) => (props?.isDisabled ? 'auto' : 'pointer')};
  pointer-events: ${(props) => (props?.isDisabled ? 'none' : 'all')};
  position: relative;
  z-index: 1;
  text-decoration: none;
  box-sizing: border-box;

  ${Primary}
  ${Secondary}
  ${Outline}
  ${Plain}
  ${Disable}
  ${Confirmed}

  > * {
    user-select: none;
  }
`;

export const IconAfter = styled.div`
  color: white;
  margin-left: 10px;
`;

export const IconBefore = styled.div`
  color: white;
  margin-right: 10px;
`;
