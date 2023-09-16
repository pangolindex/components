import { AirdropType } from '@pangolindex/sdk';

export const argTypes = {
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
  contractAddress: {
    name: 'contractAddress',
    control: 'text',
    description: 'Airdrop contract address.',
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
  type: {
    name: 'type',
    options: [
      AirdropType.LEGACY,
      AirdropType.MERKLE,
      AirdropType.MERKLE_TO_STAKING,
      AirdropType.MERKLE_TO_STAKING_COMPLIANT,
      AirdropType.NEAR_AIRDROP,
    ],
    control: { type: 'radio' },
    description: 'The type of airdrop contract.',
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
  title: {
    name: 'title',
    control: 'text',
    description: 'The title of airdrop.',
    type: {
      required: false,
    },
    table: {
      type: {
        name: 'string',
        summary: 'string',
      },
    },
  },
  chain: {
    name: 'chain',
    control: 'object',
    description: 'The chain interface.',
    type: {
      required: false,
    },
    table: {
      type: {
        name: 'Chain',
        summary: 'Chain',
        detail: `import { Chain } from '@pangolindex/sdk';\nconst chain = {name: "test", ...} as const satisfies Chain`,
      },
    },
  },
  onComplete: {
    name: 'onComplete',
    control: 'function',
    description: 'The function to be executed after successfully claiming.',
    type: {
      required: false,
    },
    table: {
      type: {
        name: 'function',
        summary: 'function',
        detail: `const onComplete = () => alert('success')`,
      },
    },
  },
};
