import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Minus, Plus } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, Text } from 'src/components';
import { BlackBox, InputText, PriceSection, Wrapper } from './styles';
import { PriceInputProps } from './types';

const PriceInput: React.FC<PriceInputProps> = (props) => {
  const {
    value,
    decrement,
    increment,
    decrementDisabled = false,
    incrementDisabled = false,
    locked,
    onUserInput,
    title,
    tokenA,
    tokenB,
  } = props;
  const theme = useContext(ThemeContext);

  // let user type value and only update parent value on blur
  const [localValue, setLocalValue] = useState('');
  const [useLocalValue, setUseLocalValue] = useState(false);

  const handleOnFocus = () => {
    setUseLocalValue(true);
  };

  const handleOnBlur = useCallback(() => {
    setUseLocalValue(false);

    onUserInput(localValue); // trigger update on parent value
  }, [localValue, onUserInput]);

  // for button clicks
  const handleDecrement = useCallback(() => {
    setUseLocalValue(false);
    onUserInput(decrement());
  }, [decrement, onUserInput]);

  const handleIncrement = useCallback(() => {
    setUseLocalValue(false);
    onUserInput(increment());
  }, [increment, onUserInput]);

  useEffect(() => {
    if (localValue !== value && !useLocalValue) {
      setTimeout(() => {
        setLocalValue(value); // reset local value to match parent
      }, 0);
    }
  }, [localValue, useLocalValue, value]);

  return (
    <Wrapper onFocus={handleOnFocus} onBlur={handleOnBlur}>
      <Box display={'flex'} mb={'10px'}>
        <Text color={'text16'} fontSize={'12px'} fontWeight={500}>
          {title}
        </Text>
      </Box>
      <PriceSection mb={'10px'}>
        {!locked && (
          <BlackBox onClick={handleDecrement} disabled={decrementDisabled}>
            <Minus color={theme?.color11} size={14} />
          </BlackBox>
        )}

        <InputText
          value={localValue}
          fontSize={20}
          disabled={locked}
          onChange={(val) => {
            setLocalValue(val);
          }}
          isNumeric={localValue !== '∞'}
          placeholder="0.00"
        />

        {!locked && (
          <BlackBox onClick={handleIncrement} disabled={incrementDisabled}>
            <Plus color={theme?.color11} size={14} />
          </BlackBox>
        )}
      </PriceSection>
      <Box display={'flex'}>
        <Text color={'text16'} fontSize={'12px'} fontWeight={500}>
          {tokenB} per {tokenA}
        </Text>
      </Box>
    </Wrapper>
  );
};

export default PriceInput;
