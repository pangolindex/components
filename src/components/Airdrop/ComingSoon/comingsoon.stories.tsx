import { ComponentStory } from '@storybook/react';
import React from 'react';
import { PNG } from 'src/constants/tokens';
import ComingSong from '.';

export default {
  component: ComingSong,
  title: 'DeFi Primitives/Airdrop/ComingSong',
  argTypes: {
    token: {
      name: 'token',
      control: 'object',
      description: 'The airdropped token.',
      type: {
        required: true,
      },
      table: {
        type: {
          name: 'token',
          summary: 'new Token(...)',
          detail: `import { ChainId, Token } from '@pangolindex/sdk';\n// chainId = 43314 or ChainId.AVALANCHE \nconst token = new Token(ChainId.AVALANCHE, '0x60781c2586d68229fde47564546784ab3faca982', 18, 'PNG', 'Pangolin');`,
        },
      },
    },
    logo: {
      name: 'logo',
      control: 'text',
      description: 'The logo of airdrop, can be the token logo.',
      type: {
        required: true,
      },
      table: {
        type: {
          name: 'string',
          summary: 'string',
        },
      },
    },
  },
};

const TemplateComingSoon: ComponentStory<typeof ComingSong> = (args: any) => {
  return (
    <div style={{ width: '400px' }}>
      <ComingSong {...args} />
    </div>
  );
};

export const Default = TemplateComingSoon.bind({});
Default.args = {
  token: PNG[43114],
  logo: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0x60781C2586D68229fde47564546784ab3fACA982/logo_48.png',
};
