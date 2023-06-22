import { ComponentStory } from '@storybook/react';
import React from 'react';
import { PNG } from 'src/constants/tokens';
import HederaAirdrop from '.';

export default {
  component: HederaAirdrop,
  title: 'DeFi Primitives/Airdrop/HederaAirdrop',
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

const TemplateHederaAirdrop: ComponentStory<typeof HederaAirdrop> = (args: any) => {
  return (
    <div style={{ width: '400px' }}>
      <HederaAirdrop {...args} />
    </div>
  );
};

export const Default = TemplateHederaAirdrop.bind({});
Default.args = {
  token: PNG[296],
  logo: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/296/0x000000000000000000000000000000000040B1FA/logo_48.png',
};
