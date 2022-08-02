import React from 'react';
import { useSarPositions } from 'src/state/psarstake/hooks';
import { Box } from '../Box';
import { Button } from '../Button';
import { Loader } from '../Loader';
import { Text } from '../Text';
import Portfolio from './Portfolio';
import { Root } from './styleds';

export default function SarNFTPortfolio() {
  const { positions, isLoading } = useSarPositions();

  const renderBody = () => {
    if (isLoading) {
      return (
        <Box justifyContent="center" alignItems="center" width="100%" height="100%">
          <Loader size={40} />
        </Box>
      );
    } else if (positions.length === 0) {
      return (
        <Box
          display="grid"
          justifyItems="center"
          alignContent="center"
          width="100%"
          height="100%"
          style={{ gridGap: '30px' }}
        >
          <Text color="text1" fontSize="18px" fontWeight={500} textAlign="center">
            You dont have any PANGUARDIAN NFT.
          </Text>
          <Text color="text1" fontSize="18px" fontWeight={500} textAlign="center">
            LETS GET YOU ONE
          </Text>
          <Button variant="primary" width="250px">
            START
          </Button>
        </Box>
      );
    }
    return <Portfolio positions={positions} />;
  };

  return <Root>{renderBody()}</Root>;
}
