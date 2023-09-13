import { Box, Button, NewsWidget } from '@honeycomb-finance/core';
import { MyPortfolio, Portfolio, WatchList } from '@honeycomb-finance/portfolio';
import React from 'react';
import { GridContainer, PortfolioContainer } from './styled';

function Sample() {
  return (
    <Box>
      <GridContainer>
        <NewsWidget />
        <Button type="button" variant="primary" loading={true}>
          Test
        </Button>
      </GridContainer>
      <PortfolioContainer>
        <MyPortfolio />
        <Portfolio />
      </PortfolioContainer>
      <Box height={400} mb="20px">
        <WatchList />
      </Box>
    </Box>
  );
}

export default Sample;
