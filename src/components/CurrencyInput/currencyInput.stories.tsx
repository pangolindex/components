import { ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { CurrencyInput } from '.';

export default {
  component: CurrencyInput,
  title: 'Pangolin/CurrencyInputs',
};

const TemplateCurrencyInput: ComponentStory<typeof CurrencyInput> = (args: any) => <CurrencyInput {...args} />;

export const Default = TemplateCurrencyInput.bind({});
Default.args = {
  label: 'To',
  currency: new Token(ChainId.AVALANCHE, '0x60781C2586D68229fde47564546784ab3fACA982', 18, 'PNG', 'Pangolin'),
};
