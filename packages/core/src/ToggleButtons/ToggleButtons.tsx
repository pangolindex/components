import React from 'react';
import { Root, TextButton } from './styles';
import { ToggleButtonsProps } from './types';

const ToggleButtons: React.FC<ToggleButtonsProps> = (props) => {
  const { value, onChange, options } = props;

  return (
    <Root>
      {(options || []).map((option, i) => (
        <TextButton
          key={i}
          selected={option === value}
          onClick={() => {
            onChange && onChange(option);
          }}
        >
          {option}
        </TextButton>
      ))}
    </Root>
  );
};

export default ToggleButtons;
