# Honeycomb

Honeycomb is combination of various web3 components. This repo is using Turborepo to manage monorepo packages.

### Packages

It contains below packages.

- `@honeycomb-finance/airdrop`: Airdrop Widget
- `@honeycomb-finance/bridge`: Bridge Widget
- `@honeycomb-finance/core`: honeycomb core component library
- `@honeycomb-finance/elixir`: Elixir Widget which is based on Pangolin v2 pools
- `@honeycomb-finance/governance`: Governance Widget 
- `@honeycomb-finance/honeycomb-provider`: main entrypoint package for most of the consumer
- `@honeycomb-finance/pools`: Pangolin Pools Widget 
- `@honeycomb-finance/portfolio`: Portfolio related components
- `rollup-plugin-tsc-alias`: rollup plugin to transform absolute path to relative path in declaration files
- `@honeycomb-finance/sar`: Sunshine and Rainbow widget
- `@honeycomb-finance/shared`: shared stuff across all packages
- `@honeycomb-finance/state-hooks`: state manager and common hooks
- `@honeycomb-finance/swap`: swap widget
- `@honeycomb-finance/token-drawer`: Token Drawer widget
- `@honeycomb-finance/tsconfig`: common typescript configuration
- `@honeycomb-finance/wallet-connectors`: Wallet connectors
- `@honeycomb-finance/walletmodal`: wallet modal ui

## Running Example App

In monorepo root run below commands

1. `yarn install`
2. `yarn start:app` which will start app on `5173` port.

## Development

In monorepo root run below commands

1. `yarn install`
2. `yarn dev:packages` and keep that terminal running
3. In another terminal run `yarn dev:app` which will start app on `5173` port.

## Contrinuting Guide

Please see [our guide to contributing](CONTRIBUTING.md).

## Release

Please see [our guide to releasing](RELEASING.md).