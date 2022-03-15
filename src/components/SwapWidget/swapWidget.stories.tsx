import SwapWidget from '.';
import { Box } from '../Box';

export default {
  component: Text,
  title: 'Pangolin/SwapWidget',
};

export const Swap = () => (
  <Box width="100%" style={{ background: '#111111' }}>
    <Box maxWidth="400px">
      <SwapWidget />
    </Box>
  </Box>
);
