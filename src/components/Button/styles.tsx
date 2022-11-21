import get from 'lodash.get';
import { lighten } from 'polished';
import styled, { css } from 'styled-components';
import { ButtonProps } from './types';

const Primary = (props: ButtonProps) =>
  props.variant === 'primary' &&
  css`
    background-color: ${({ theme }) => theme.button?.primary?.background};
    color: ${({ theme }) => theme.button?.primary?.color};
  `;

const Secondary = (props: ButtonProps) =>
  props.variant === 'secondary' &&
  css`
    background-color: ${({ theme }) => theme.button?.secondary?.background};
    color: ${({ theme }) => theme.button?.secondary?.background};
  `;

const Outline = (props: ButtonProps) =>
  props.variant === 'outline' &&
  css`
    border: 1px solid ${({ theme }) => theme.button?.outline?.borderColor};
    background-color: transparent;
    color: ${({ theme }) => theme.button?.outline?.color};
  `;

const Plain = (props: ButtonProps) =>
  props.variant === 'plain' &&
  css`
    background-color: transparent;
    color: ${({ theme }) => theme.button?.plain?.color};
    display: flex;
    justify-content: center;
    align-items: center;
  `;

const Disable = (props: ButtonProps) =>
  (props.isDisabled || props.loading) &&
  css`
    background-color: ${({ theme }) => theme.button?.disable?.background};
    border: 1px solid transparent;
    color: ${({ theme }) => theme.button?.disable?.color};
    cursor: auto;
    pointer-events: none;
  `;

const Confirmed = (props: ButtonProps) =>
  props.variant === 'confirm' &&
  css`
    background-color: ${({ theme }) => lighten(0.5, theme?.button?.confirmed?.background || theme?.oceanBlue)};
    color: ${({ theme }) => theme.button?.confirmed?.color};
    border: 1px solid ${({ theme }) => theme.button?.confirmed?.borderColor};
    opacity: 50%;
    cursor: auto;
  `;

export const Root = styled.button<ButtonProps>`
  padding: ${(props) => (props?.padding ? props?.padding : '0px')};
  width: ${({ width }) => (width ? width : '100%')};
  height: ${({ height }) => (height ? height : '51px')};
  font-weight: 500;
  text-align: center;
  border-radius: ${(props) => props?.borderRadius ?? '8px'};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
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

  /* Customizable Colors */
  color: ${({ color, theme }) => color && get(theme, color, color)};
  background-color: ${({ backgroundColor, theme }) => backgroundColor && get(theme, backgroundColor, backgroundColor)};
  border: ${({ borderColor, theme }) => `1px solid ${borderColor && get(theme, borderColor, borderColor)}`};

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
