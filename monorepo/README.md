# Honeycomb

Honeycomb is combination of various web3 components. This repo is using Turborepo to manage monorepo packages.

### Packages

It contains below packages.

- `@pangolidex/core`: honeycomb core component library
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `rollup-plugin-tsc-alias`: rollup plugin to transform absolute path to relative path in declaration files
- `@pangolidex/honeycomb-provider`: main entrypoint
- `@pangolidex/portfolio`: Portfolio related components
- `@pangolidex/sar`: Sunshine and Rainbow widget
- `@pangolidex/shared`: shared things
- `@pangolidex/state-hooks`: state manager and common hooks
- `@pangolidex/swap`: swap widget
- `@pangolidex/tsconfig`: common typescript configuration
- `@pangolidex/wallet-connectors`:
- `@pangolidex/walletmodal`: wallet modal ui

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

Coming Soon

## CI/CD

Coming Soon