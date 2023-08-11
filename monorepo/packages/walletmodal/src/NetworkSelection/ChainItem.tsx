import React from 'react';
import { Text } from '@pangolindex/core';
import { Chain } from '@pangolindex/sdk';
import { Item, StyledLogo } from './styled';

interface Props {
  chain: Chain;
  onClick: () => void;
}

const ChainItem: React.FC<Props> = ({ chain, onClick }) => {
  return (
    <Item onClick={onClick}>
      <StyledLogo srcs={[chain.logo ?? '']} alt={chain.logo} />
      <Text fontSize="16px" fontWeight={500} color="text1" textAlign="center">
        {chain.name}
      </Text>
    </Item>
  );
};

export default ChainItem;
