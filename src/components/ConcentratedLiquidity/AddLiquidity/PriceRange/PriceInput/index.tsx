import React, { useContext } from 'react';
import { Minus, Plus } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, Text } from 'src/components';
import { BlackBox, PriceSection, Wrapper } from './styles';
import { PriceInputProps } from './types';

const PriceInput: React.FC<PriceInputProps> = (props) => {
  const { currency0, currency1, price, setPrice, title } = props;
  const theme = useContext(ThemeContext);
  return (
    <Wrapper textAlign={'center'} display={'flex'} flexDirection={'column'}>
      <Box display={'flex'} mb={'10px'}>
        <Text color={'text16'} fontSize={'12px'} fontWeight={500}>
          {title}
        </Text>
      </Box>
      <PriceSection mb={'10px'}>
        <BlackBox
          onClick={() => {
            setPrice('600');
          }}
        >
          <Plus color={theme?.color11} size={14} />
        </BlackBox>
        <Text color={'color11'} fontSize={'18px'} fontWeight={500}>
          {price}
        </Text>
        <BlackBox
          onClick={() => {
            setPrice('1000');
          }}
        >
          <Minus color={theme?.color11} size={14} />
        </BlackBox>
      </PriceSection>
      <Box display={'flex'}>
        <Text color={'text16'} fontSize={'12px'} fontWeight={500}>
          {currency0?.symbol} per {currency1?.symbol}
        </Text>
      </Box>
    </Wrapper>
  );
};

export default PriceInput;
