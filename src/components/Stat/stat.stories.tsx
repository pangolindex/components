import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '../Box';
import { Stat } from '.';

export default {
  component: Stat,
  title: 'DeFi Helpers/Stat',
};

const TemplateButton: ComponentStory<typeof Stat> = (args: any) => <Stat {...args} />;

export const Simple = TemplateButton.bind({});
Simple.args = {
  title: 'Pool Share',
  stat: '100',
  titlePosition: 'top',
  titleFontSize: 14,
  statFontSize: 16,
};

const currency1 = new Token(
  ChainId.AVALANCHE,
  CHAINS[ChainId.AVALANCHE].contracts!.png,
  18,
  CHAINS[ChainId.AVALANCHE].png_symbol!,
  'Pangolin',
);

const TemplateCurrencyStat: ComponentStory<typeof Stat> = (args: any) => <Stat {...args} />;

export const CurrencyStat = TemplateCurrencyStat.bind({});
CurrencyStat.args = {
  title: 'Underlying Png',
  stat: 2000,
  titlePosition: 'top',
  titleFontSize: 12,
  statFontSize: 20,
  titleColor: 'text2',
  currency: currency1,
  showAnalytics: true,
};

const TemplateMultipleCurrencyStat: ComponentStory<typeof Stat> = () => {
  return (
    <Box display="flex">
      <Stat
        title={`Underlying Png`}
        stat={`2000`}
        titlePosition="top"
        titleFontSize={12}
        statFontSize={[20, 16]}
        titleColor="text2"
        currency={currency1}
        showAnalytics={true}
      />
      <Stat
        title={`Underlying Png`}
        stat={`2000`}
        titlePosition="top"
        titleFontSize={12}
        statFontSize={[20, 16]}
        titleColor="text2"
        currency={currency1}
        showAnalytics={true}
      />

      <Stat title={`Pool Share`} stat={`100`} titlePosition="top" titleFontSize={14} statFontSize={[20, 16]} />
    </Box>
  );
};

export const MultipleCurrencyStat = TemplateMultipleCurrencyStat.bind({});
