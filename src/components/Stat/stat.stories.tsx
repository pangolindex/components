import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Stat } from '.';

export default {
  component: Stat,
  title: 'Components/Stat',
};

const TemplateSimpleStat: ComponentStory<typeof Stat> = () => {
  return <Stat title="Pool Share" stat={'100'} titlePosition="top" titleFontSize={14} statFontSize={16} />;
};

export const Simple = TemplateSimpleStat.bind({});

const TemplateCurrencyStat: ComponentStory<typeof Stat> = () => {
  const currency1 = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );

  return (
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
  );
};

export const CurrencyStat = TemplateCurrencyStat.bind({});
