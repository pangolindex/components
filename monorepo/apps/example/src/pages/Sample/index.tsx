import { Button, NewsWidget } from '@pangolindex/core';
import React from 'react';
import { GridContainer } from './styled';

function Sample() {
  return (
    <GridContainer>
      <NewsWidget />
      <Button type="button" variant="primary" loading={true}>
        Test
      </Button>
    </GridContainer>
  );
}

export default Sample;
