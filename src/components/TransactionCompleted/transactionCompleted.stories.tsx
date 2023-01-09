import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '../Box';
import TransactionCompleted from '.';

export default {
  component: TransactionCompleted,
  title: 'DeFi Helpers/TransactionCompleted',
};

const TemplateTransactionCompleted: ComponentStory<typeof TransactionCompleted> = (args: any) => (
  <Box width="100%">
    <Box maxWidth="400px">
      <TransactionCompleted {...args} />
    </Box>
  </Box>
);

export const Dafault = TemplateTransactionCompleted.bind({});
Dafault.args = {
  submitText: 'Your liquidity removed from farm, And accrued rewards claimed!',
  isShowButtton: true,
  showCloseIcon: false,
  buttonText: 'Remove',
};
