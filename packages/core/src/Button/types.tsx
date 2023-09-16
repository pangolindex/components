import * as React from 'react';

export type ButtonProps = ButtonStyleProps & {
  /** Set as disabled button */
  isDisabled?: boolean;
  /** Text to display in the button */
  children: string | React.ReactNode;
  /** type of the button */
  type?: 'button' | 'submit';
  /** varient of the button */
  variant: 'primary' | 'secondary' | 'outline' | 'plain' | 'confirm';
  /** icon before the button text **/
  iconBefore?: React.ReactNode | null;
  /** icon after the button text **/
  iconAfter?: React.ReactNode | null;
  /** Handler to be called when the user click. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Id value to be passed to the html input. */
  id?: string;
  /**  is loading **/
  loading?: boolean;
  /** loading icon **/
  loadingIcon?: React.ReactNode;
  loadingText?: string;
  as?: string | React.ComponentType<any>;
  href?: string;
  target?: string;
};

export type ButtonStyleProps = {
  /** button height **/
  height?: string | number;
  /** button width **/
  width?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  minWidth?: string | number;
  padding?: string;
  borderRadius?: string;
  cursor?: string;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
};
