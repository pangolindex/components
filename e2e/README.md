# synpress_metamask_login

This repo belongs to the written [tutorial](https://medium.com/coinmonks/test-e2e-login-to-dapp-with-metamask-with-synpress-5248dd1f17c1).

Synpress is a wrapper of Cypress (e2e-frontend-testing) and allows to test web3 dApps with metamask interaction. This code base accompanies the written tutorial. It helps to onboard people to dApp e2e testing.

## Getting Started

The scripts that are linked to the wallet require MetaMask setup, which can be configured using the env file. It's essential to ensure you have sufficient balances in the tokens utilized within the scripts, along with Gas token balances to cover transaction fees.

For the swap scripts, you'll find the tokens being used stored within variables named fromToken, toToken, and gasTokenName. The relevant transaction values, namely swapValue, sellTokenValue, and buyTokenValue, can be found in the pangolin-data.json file.
(Do not use AVAX and USDC as fromToken and toToken)

For the pool scripts, you'll find the tokens being used stored within variables named createPairToken1, createPairToken2, addliquidityToken1, addliquidityToken2, noPoolToken1, noPoolToken2, poolFoundToken1, poolFoundToken2 . The relevant transaction value namely addliquidityValuecan be also found in the pangolin-data.json file.
(For createPair tokens select tokens that does not exist)
(For noPool tokens select tokens that have no pool )
(For poolFound tokens select tokens that have a pool)
(Do not use AVAX as a token1)

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository: `git clone https://github.com/pangolindex/components`
2. Navigate to the project directory: `cd e2e`
3. Install dependencies: `npm install`

### Running Tests

To run scrips having wallet connected:

npm test run

To run scripts without wallet connect:

npx cypress run

## Useful Links

- https://docs.cypress.io/guides/getting-started/installing-cypress
- https://github.com/Synthetixio/synpress
- https://github.com/yvesbou/synpress_metamask_login/new/main?readme=1

Overview over possible synpress functions:

- https://github.com/synthetixio/synpress/blob/master/support/index.d.ts
