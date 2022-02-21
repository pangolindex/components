import React from 'react';
import ReactSwitch from 'react-switch';
import { useTheme } from 'src/theme';
import { SwitchProps } from './types';

// here we need to do some hack, because react-switch package is still in commonjs
// https://github.com/vitejs/vite/issues/2139#issuecomment-824557740
const BaseSwitch = (ReactSwitch as any).default ? (ReactSwitch as any).default : ReactSwitch;

const Switch: React.FC<SwitchProps> = (props) => {
  const {
    checked,
    onChange,
    checkedIcon,
    disabled,
    height,
    offColor,
    offHandleColor,
    onColor,
    onHandleColor,
    uncheckedIcon,
    width,
  } = props;
  const theme = useTheme();

  return (
    <BaseSwitch
      checked={checked}
      onChange={(isChecked) => onChange?.(isChecked)}
      onHandleColor={onHandleColor || theme.switch?.onColor}
      offHandleColor={offHandleColor || theme.switch?.offColor}
      onColor={onColor || theme.switch?.backgroundColor}
      offColor={offColor || theme.switch?.backgroundColor}
      uncheckedIcon={uncheckedIcon || false}
      checkedIcon={checkedIcon || false}
      disabled={disabled}
      height={height}
      width={width}
    />
  );
};

Switch.defaultProps = {
  onChange: () => {},
  checked: false,
  checkedIcon: false,
  disabled: false,
  uncheckedIcon: false,
};

export default Switch;
