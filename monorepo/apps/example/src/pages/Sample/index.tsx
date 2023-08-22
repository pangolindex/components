import { Box, Button, NewsWidget } from '@pangolindex/core';
import React from 'react';
import { GridContainer, PortfolioContainer } from './styled';
import { MyPortfolio, Portfolio, WatchList } from '@pangolindex/portfolio';

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
