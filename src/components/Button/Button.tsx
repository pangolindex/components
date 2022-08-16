import React from 'react';
import { IconAfter, IconBefore, Root } from './styles';
import { ButtonProps } from './types';

const Button: React.FC<ButtonProps> = (props) => {
  const {
    iconBefore,
    children,
    iconAfter,
    loading,
    loadingText,
    as,
    target,
    variant,
    isDisabled,
    btnPrimaryBgColor,
    btnPrimaryTextColor,
    btnSecondaryBgColor,
    btnSecondaryTextColor,
    btnConfirmedBgColor,
    btnConfirmedTextColor,
    ...rest
  } = props;

  const getBgColor = () => {
    if (
      ((btnPrimaryBgColor && btnPrimaryTextColor) ||
        (btnSecondaryBgColor && btnSecondaryTextColor) ||
        (btnConfirmedBgColor && btnConfirmedTextColor)) &&
      !isDisabled
    )
      switch (variant) {
        case 'primary':
          return { backgroundColor: btnPrimaryBgColor, color: btnPrimaryTextColor };
        case 'secondary':
          return { backgroundColor: btnSecondaryBgColor, color: btnSecondaryTextColor };
        case 'confirm':
          return { backgroundColor: btnConfirmedBgColor, color: btnConfirmedTextColor };
        default:
          return {};
      }
  };

  return (
    <Root {...rest} isDisabled={isDisabled} variant={variant} as={as} target={target} style={getBgColor()}>
      {loading ? (
        loadingText || 'Loading...'
      ) : (
        <>
          {iconBefore && <IconBefore>{iconBefore}</IconBefore>}
          {children}
          {iconAfter && <IconAfter>{iconAfter}</IconAfter>}
        </>
      )}
    </Root>
  );
};

Button.defaultProps = {
  target: '_blank',
};

export default Button;
