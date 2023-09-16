import React from 'react';
import { Box } from '../Box';
import Steps, { Step } from '../Steps';
import { PValue } from './styled';

import { NumberOptionsProps } from './types';

const NumberOptions: React.FC<NumberOptionsProps> = (props) => {
  const { options = [25, 50, 75, 100], isPercentage = false, onChange, currentValue, isDisabled, variant } = props;
  return (
    <Box>
      {variant === 'step' && (
        <Steps
          onChange={(value) => {
            onChange && onChange(value);
          }}
          current={currentValue}
          progressDot={true}
        >
          <Step disabled={isDisabled} />
          <Step disabled={isDisabled} />
          <Step disabled={isDisabled} />
          <Step disabled={isDisabled} />
          <Step disabled={isDisabled} />
        </Steps>
      )}

      {variant === 'box' && (
        <Box display="flex" pb="5px">
          {options.map((value, index) => (
            <PValue
              key={index}
              isActive={currentValue === value}
              onClick={() => {
                onChange && onChange(value);
              }}
            >
              {isPercentage ? `${value}%` : value}
            </PValue>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NumberOptions;
