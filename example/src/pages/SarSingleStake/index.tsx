import { Box, SarNFTPortfolio, SarStakeWidget, SarManageWidget } from '@components/components';
import { Position } from '@components/index';
import React, { useState } from 'react';
import { PageWrapper } from './styled';

export default function SarStake() {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  function onSelectPosition(position: Position | null) {
    setSelectedPosition(position);
  }

  return (
    <PageWrapper>
      <Box style={{ gridArea: 'images' }}>
        <SarNFTPortfolio onSelectPosition={onSelectPosition} />
      </Box>
      <Box style={{ gridArea: 'stake' }} minWidth="330px" display="flex" flexDirection="column">
        <Box>
          <SarManageWidget selectedPosition={selectedPosition} />
        </Box>
        <Box mt={10} mb={10}>
          <SarStakeWidget />
        </Box>
      </Box>
    </PageWrapper>
  );
}
