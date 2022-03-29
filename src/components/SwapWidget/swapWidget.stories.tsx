import React from 'react';
import { Box } from '../Box';
import SwapWidget from '.';

export default {
  component: Text,
  title: 'Pangolin/SwapWidget',
};

export const Swap = () => (
  <Box width="100%">
    <Box maxWidth="400px">
      <SwapWidget />
    </Box>
  </Box>
);
