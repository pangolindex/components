import { ComponentStory } from '@storybook/react';
import React from 'react';
import { PriceCardProps } from './types';
import PriceCard from '.';

export default {
  component: PriceCard,
  title: 'DeFi Primitives/Elixir/DetailModal/Tabs/DetailTab/PriceCard',
  parameters: {
    docs: {
      description: {
        component: 'Price Card',
      },
    },
  },
  argTypes: {
    title: {
      name: 'Title',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Title',
    },
    price: {
      name: 'Price',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Price',
    },
    currencyPair: {
      name: 'Currency Pair',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Currency Pair',
    },
    description: {
      name: 'Description',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Description',
    },
  },
};

const TemplatePriceCard: ComponentStory<typeof PriceCard> = (args: any) => {
  return (
    <div style={{ maxWidth: '150px' }}>
      <PriceCard {...args} />
    </div>
  );
};

export const Default = TemplatePriceCard.bind({});
Default.args = {
  title: 'Min Price',
  price: '784.5',
  currencyPair: 'USDT/DAI',
  description: 'The minimum price of the pair',
} as Partial<PriceCardProps>;
