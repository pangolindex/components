import React from 'react';
import { IconAfter, IconBefore, Root } from './styles';
import { ButtonProps } from './types';

const Button: React.FC<ButtonProps> = (props) => {
  const { iconBefore, children, iconAfter, ...rest } = props;
  return (
    <Root {...rest}>
      {iconBefore && <IconBefore>{iconBefore}</IconBefore>}
      {children}
      {iconAfter && <IconAfter>{iconAfter}</IconAfter>}
    </Root>
  );
};

export default Button;
