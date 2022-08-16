import React from 'react';
import { Root, TextButton } from './styles';
import { ToggleButtonsProps } from './types';

const ToggleButtons: React.FC<ToggleButtonsProps> = (props) => {
  const { value, onChange, options, toggleBgColor, toggleSelectedColor, toggleTextColor } = props;

  return (
    <Root style={toggleBgColor ? { background: toggleBgColor } : {}}>
      {(options || []).map((option, i) => (
        <TextButton
          key={i}
          selected={option === value}
          onClick={() => {
            onChange && onChange(option);
          }}
          style={
            toggleBgColor && toggleSelectedColor && toggleTextColor
              ? option === value
                ? { background: toggleSelectedColor, color: toggleTextColor }
                : { background: toggleBgColor, color: toggleTextColor }
              : {}
          }
        >
          {option}
        </TextButton>
      ))}
    </Root>
  );
};

export default ToggleButtons;
