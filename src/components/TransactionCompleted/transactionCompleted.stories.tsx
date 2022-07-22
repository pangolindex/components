import { ComponentStory } from '@storybook/react';
import TransactionCompleted from '.';
import { Box } from '../Box';

export default {
  component: TransactionCompleted,
  title: 'Components/TransactionCompleted',
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
