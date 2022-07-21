import { ComponentStory } from '@storybook/react';
import TransactionCompleted from '.';
import { Box } from '../Box';

export default {
  component: TransactionCompleted,
  title: 'Components/TransactionCompleted',
};

const TemplateSimpleTransactionCompleted: ComponentStory<typeof TransactionCompleted> = () => {
  return (
    <Box width="100%">
      <Box maxWidth="400px">
        <TransactionCompleted
          onClose={() => {}}
          submitText="Your liquidity removed from farm, And accrued rewards claimed!"
          isShowButtton={true}
          onButtonClick={() => {}}
          buttonText="Remove"
        />
      </Box>
    </Box>
  );
};

export const Dafault = TemplateSimpleTransactionCompleted.bind({});
