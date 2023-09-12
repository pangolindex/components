import { AirdropType } from '@pangolindex/sdk';
import { PNG, ZERO_ADDRESS } from '@honeycomb/shared';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { argTypes } from './argTypes';
import Airdrop from '.';

export default {
  component: Airdrop,
  title: 'DeFi Primitives/Airdrop/Airdrop',
  argTypes: argTypes,
};

const TemplateAirdrop: ComponentStory<typeof Airdrop> = (args: any) => {
  return (
    <div style={{ width: '400px' }}>
      <Airdrop {...args} />
    </div>
  );
};

export const Default = TemplateAirdrop.bind({});
Default.args = {
  contractAddress: ZERO_ADDRESS,
  type: AirdropType.MERKLE_TO_STAKING,
  token: PNG[43114],
  logo: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0x60781C2586D68229fde47564546784ab3fACA982/logo_48.png',
};

export const Songbird = TemplateAirdrop.bind({});
Songbird.args = {
  contractAddress: '0x3B8377E6a9d527b4587F251bce706b53DAC26cf6',
  type: AirdropType.MERKLE_TO_STAKING_COMPLIANT,
  token: PNG[19],
  logo: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/19/0xb2987753D1561570f726Aa373F48E77e27aa5FF4/logo_48.png',
};
