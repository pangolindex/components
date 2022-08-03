import React from 'react';
import { usePangolinWeb3 } from 'src/hooks';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Position, useSarPositions } from 'src/state/psarstake/hooks';
import { Box } from '../Box';
import { Button } from '../Button';
import { Loader } from '../Loader';
import { Text } from '../Text';
import Portfolio from './Portfolio';
import { Root } from './styleds';

interface Props {
  onSelectPosition: (position: Position | null) => void;
}

export default function SarNFTPortfolio({ onSelectPosition }: Props) {
  const { account } = usePangolinWeb3();
  const { positions, isLoading } = useSarPositions();

  const toggleWalletModal = useWalletModalToggle();

  const focusCreatePosition = () => {
    document.getElementById('create-sar-position-widget')?.scrollIntoView({
      behavior: 'smooth',
    });
    document.getElementById('sar-stake-input')?.focus();
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <Box justifyContent="center" alignItems="center" width="100%" height="100%">
          <Loader size={100} />
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
          {!account ? (
            <Button variant="primary" width="250px" onClick={toggleWalletModal}>
              Connect to a wallet
            </Button>
          ) : (
            <Button variant="primary" width="250px" onClick={focusCreatePosition}>
              START
            </Button>
          )}
        </Box>
      );
    }
    return <Portfolio positions={positions} onSelectPosition={onSelectPosition} />;
  };

  return <Root>{renderBody()}</Root>;
}
