import React from 'react';
import { SwapWidget, WatchList } from '@components/index';
import { SwapWidgetWrapper, GridContainer } from './styled';

function Swap() {
  return (
    <GridContainer>
      <WatchList coinChartVisible={true} />
      <SwapWidgetWrapper>
        <SwapWidget />
      </SwapWidgetWrapper>
    </GridContainer>
  );
}

export default Swap;
