import { Text } from '@honeycomb/core';
import React from 'react';
import { Description, Wrapper } from './styles';
import { PriceCardProps } from './types';

const PriceCard: React.FC<PriceCardProps> = (props) => {
  const { title, price, currencyPair, description } = props;
  return (
    <Wrapper>
      <Text fontSize={18} fontWeight={500} color={'text16'}>
        {title}
      </Text>
      <Text fontSize={28} fontWeight={700} color={'color11'}>
        {price}
      </Text>
      <Text fontSize={12} fontWeight={500} color={'text16'}>
        {currencyPair}
      </Text>
      <Description fontSize={12} textAlign={'center'} fontWeight={500} color={'color11'}>
        {description}
      </Description>
    </Wrapper>
  );
};

export default PriceCard;
