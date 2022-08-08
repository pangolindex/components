import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePangolinWeb3 } from 'src/hooks';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Position, useSarPositions } from 'src/state/psarstake/hooks';
import { Box } from '../Box';
import { Button } from '../Button';
import { Loader } from '../Loader';
import { Text } from '../Text';
import Portfolio from './Portfolio';
import { Overlay, Root } from './styleds';

interface Props {
  onSelectPosition: (position: Position | null) => void;
}

export default function SarNFTPortfolio({ onSelectPosition }: Props) {
  const { account } = usePangolinWeb3();
  const { positions, isLoading } = useSarPositions();

  const toggleWalletModal = useWalletModalToggle();

  const { t } = useTranslation();

  const sarOverlayElement = document.getElementById('sar-portfolio-overlay');
  const displayOverlay = () => {
    if (sarOverlayElement) {
      sarOverlayElement.style.display = 'block';
    }
  };
  const hideOverlay = () => {
    if (sarOverlayElement) {
      sarOverlayElement.style.display = 'none';
    }
  };

  const focusCreatePosition = () => {
    document.getElementById('create-sar-position-widget')?.scrollIntoView({
      behavior: 'smooth',
    });
    displayOverlay();
  };

  // remove overlay when user change the account
  useEffect(() => {
    hideOverlay();
  }, [account]);

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
            {t('sarPortfolio.noPositions')}
          </Text>
          {!account ? (
            <Button variant="primary" width="250px" onClick={toggleWalletModal}>
              {t('removeLiquidity.connectWallet')}
            </Button>
          ) : (
            <Button variant="primary" width="250px" onClick={focusCreatePosition}>
              {t('sarPortfolio.start')}
            </Button>
          )}
        </Box>
      );
    }
    return <Portfolio positions={positions} onSelectPosition={onSelectPosition} />;
  };

  return (
    <Root>
      {renderBody()}
      <Overlay id="sar-portfolio-overlay" onClick={hideOverlay} />
    </Root>
  );
}
