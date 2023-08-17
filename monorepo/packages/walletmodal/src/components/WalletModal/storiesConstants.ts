export const argTypes = {
  onWalletConnect: {
    name: 'onWalletConnect',
    control: 'function',
    description: 'Function that is executed when connecting to a wallet successfully',
    type: {
      required: true,
    },
    table: {
      type: {
        name: 'function',
        summary: 'function',
        detail: '() => void',
      },
    },
  },
  initialChainId: {
    name: 'initialChainId',
    control: 'number',
    description: 'The id number of chain that will open initially.',
    type: {
      required: false,
    },
    defaultValue: 43114,
    table: {
      type: {
        name: 'number',
        summary: 'number',
      },
    },
  },
  supportedWallets: {
    name: 'supportedWallets',
    control: 'object',
    description: 'Object of wallets supported by Wallet Modal',
    type: {
      required: false,
    },
    table: {
      type: {
        name: 'object',
        summary: '{ WALLET: new Wallet(...), WALLET2: new Wallet(...)}',
        detail: `import { Wallet } from '@pangolindex/components';\n const wallet = new Wallet(...)\n const wallet2 = new Wallet(...)\n const supportedWallets = {wallet: wallet, wallet2: wallet2}`,
      },
    },
  },
  supportedChains: {
    name: 'supportedChains',
    control: 'object',
    description: 'Array of chain interface from sdk, supported by the WalletMdaol',
    type: {
      required: false,
    },
    table: {
      type: {
        name: 'object',
        summary: 'Chain[]',
        detail: `import { AVALANCHE_MAINNET, HEDERA } from '@pangolindex/sdk';\nconst supportedChains = [AVALANCHE_MAINNET, HEDERA]`,
      },
    },
  },
  open: {
    name: 'open',
    control: 'boolean',
    description: 'If the modal is open',
    type: {
      required: true,
    },
    table: {
      category: 'Modal',
      type: {
        name: 'boolean',
        summary: 'boolean',
      },
    },
  },
  closeModal: {
    name: 'closeModal',
    control: 'function',
    description: 'Function to close the modal',
    type: {
      required: true,
    },
    table: {
      category: 'Modal',
      type: {
        name: 'function',
        summary: 'function',
        detail: '() => void',
      },
    },
  },
};
