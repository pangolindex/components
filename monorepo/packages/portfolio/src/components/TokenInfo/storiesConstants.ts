import { ChainId, Token, TokenAmount } from '@pangolindex/sdk';
import { ZERO_ADDRESS } from '@pangolindex/shared';

export const customToken = new Token(ChainId.AVALANCHE, ZERO_ADDRESS, 18, 'DUMMY', 'DUMMY TOKEN');
export const totalSupply = new TokenAmount(customToken, '30000000000000000000000000');
export const circulationSupply = new TokenAmount(customToken, '1000000000000000000000000');
export const unclaimedAmount = new TokenAmount(customToken, '1000000000000000000000');

export const argTypes = {
  token: {
    name: 'token',
    control: 'object',
    description: 'The token to get the data',
    type: {
      required: true,
    },
    table: {
      category: 'Token',
      type: {
        name: 'object',
        summary: 'new Token(...)',
        detail: `import { ChainId, Token } from '@pangolindex/sdk';\n// chainId = 43314 or ChainId.AVALANCHE \nconst token = new Token(ChainId.AVALANCHE, '0x60781c2586d68229fde47564546784ab3faca982', 18, 'PNG', 'Pangolin');`,
      },
    },
  },
  logo: {
    name: 'logo',
    control: 'text',
    description: 'The url of token',
    type: {
      required: false,
    },
    table: {
      category: 'logo',
      type: {
        name: 'string',
        summary: 'string',
        detail:
          'This value will override the logo we have in our token repository.\nhttps://github.com/pangolindex/tokens',
      },
    },
  },
  unclaimedAmount: {
    name: 'unclaimedAmount',
    control: 'object',
    description: 'The value or unclaimed token of a user',
    type: {
      required: false,
    },
    table: {
      category: 'user',
      type: {
        name: 'object',
        summary: 'new TokenAmount(...)',
        detail: `import { Token, TokenAmount } from '@pangolindex/sdk';\nconst unclaimedAmount = new TokenAmount(new Token(...), '100000000000000');\n//We recommend to pass the amount according to the connected account provided in the PangolinProvider`,
      },
    },
  },
  circulationSupply: {
    name: 'circulationSupply',
    control: 'object',
    description: 'The token circulating supply',
    type: {
      required: false,
    },
    table: {
      category: 'Token',
      type: {
        name: 'object',
        summary: 'new TokenAmount(...)',
        detail: `import { Token, TokenAmount } from '@pangolindex/sdk'; \nconst circulationSupply = new TokenAmount(new Token(...), '100000000000000');`,
      },
    },
  },
  totalSupply: {
    name: 'totalSupply',
    control: 'object',
    description: 'The token total supply',
    type: {
      required: false,
    },
    table: {
      category: 'Token',
      type: {
        name: 'object',
        summary: 'new TokenAmount()',
        detail: `//This value will override the on chain token total supply provided by erc20.totalSupply() function\nimport { Token, TokenAmount } from '@pangolindex/sdk'; \nconst totalSupply = new TokenAmount(new Token(...), '100000000000000');`,
      },
    },
  },
  animatedLogo: {
    name: 'animatedLogo',
    control: 'boolean',
    description: 'If the token logo has animation',
    table: {
      category: 'logo',
      type: {
        name: 'boolean',
        required: false,
        summary: 'boolean',
      },
    },
  },
};
