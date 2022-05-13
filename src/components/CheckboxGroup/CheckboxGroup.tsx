import React, { useEffect, useState } from 'react';
import { Box } from '../Box';
import { Checkbox } from '../Checkbox';
import { Root } from './styles';
import { CheckboxGroupProps } from './types';

const CheckboxGroup: React.FC<CheckboxGroupProps> = (props) => {
  const { value, onChange, options, type, ...rest } = props;

  const [selected, setSelected] = useState([] as Array<any>);

  const handleOnChange = (isChecked: boolean, checkValue: string) => {
    const index = selected?.indexOf(checkValue);
    const newValues = [...selected];

    if (isChecked) {
      (newValues || [])?.push(checkValue);
    } else {
      (newValues || []).splice(index, 1);
    }
    setSelected(newValues);
    onChange?.(newValues);
  };

  useEffect(() => {
    if (value) {
      setSelected(value as Array<any>);
    }
  }, [value]);

  return (
    <Root type={type}>
      {(options || []).map((option, i) => (
        <Box key={i} ml={type === 'horizontal' ? '5px' : '0px'}>
          <Checkbox
            value={option.value}
            label={option.label}
            onChange={(checked: boolean, someValue: string) => {
              handleOnChange(checked, someValue);
            }}
            checked={selected?.indexOf(option.value) > -1 ? true : false}
            {...rest}
          />
        </Box>
      ))}
    </Root>
  );
};

export default CheckboxGroup;
