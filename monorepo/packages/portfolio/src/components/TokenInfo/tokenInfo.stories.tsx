import { ChainId } from '@pangolindex/sdk';
import { PNG } from '@pangolindex/shared';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import TokenInfo from './TokenInfo';
import { argTypes, circulationSupply, customToken, totalSupply, unclaimedAmount } from './storiesConstants';

export default {
  component: TokenInfo,
  title: 'Defi Helpers/TokenInfo',
  argTypes: argTypes,
};

const TemplateTokenInfo: ComponentStory<typeof TokenInfo> = (args: any) => (
  <div style={{ width: '420px' }}>
    <TokenInfo {...args} />
  </div>
);

export const Default = TemplateTokenInfo.bind({});
Default.args = {
  token: PNG[ChainId.AVALANCHE],
};

export const Custom = TemplateTokenInfo.bind({});
Custom.args = {
  token: customToken,
  totalSupply,
  circulationSupply,
  unclaimedAmount,
  animatedLogo: true,
  logo: 'https://raw.githubusercontent.com/pangolindex/assets/main/subDAO_logos/PNG/COINLOGO-AVALANCHE.png',
};
