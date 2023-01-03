import { Chain } from '@pangolindex/sdk';
import React from 'react';
import { Box, Text } from 'src/components';
import { StyledLogo } from './styled';

interface Props {
  chain: Chain;
  onClick: () => void;
}

const ChainItem: React.FC<Props> = ({ chain, onClick }) => {
  return (
    <Box
      bgColor="color10"
      borderRadius="4px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="120px"
      style={{ cursor: 'pointer' }}
      padding="10px"
      onClick={onClick}
    >
      <StyledLogo srcs={[chain.logo ?? '']} alt={chain.logo} />
      <Text fontSize="16px" fontWeight={500} color="text1" textAlign="center">
        {chain.name}
      </Text>
    </Box>
  );
};

export default ChainItem;
