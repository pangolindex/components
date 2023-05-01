import React from 'react';
import { SwapWidget, WatchList } from '@components/index';
import { SwapWidgetWrapper, GridContainer } from './styled';
import { CHAINS } from '@pangolindex/sdk';
import { useChainId } from '@components/hooks';

function Swap() {
  const chainId = useChainId();

  return (
    <GridContainer>
      <WatchList coinChartVisible={true} />
      <SwapWidgetWrapper>
        <SwapWidget
          isTWAPOrderVisible={CHAINS[chainId]?.mainnet && CHAINS[chainId]?.supported_by_twap}
          isLimitOrderVisible={CHAINS[chainId]?.mainnet && CHAINS[chainId]?.supported_by_gelato}
        />
      </SwapWidgetWrapper>
    </GridContainer>
  );
}

export default Swap;
