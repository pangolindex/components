import { Web3Provider } from '@ethersproject/providers';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';
import { ALL_CHAINS, AVALANCHE_MAINNET, CHAINS, ChainId, NetworkType } from '@pangolindex/sdk';
import { InjectedConnector } from '@pangolindex/web3-react-injected-connector';
import { TalismanConnector } from '@talismn/web3react-v6-connector';
import { AvalancheCoreConnector } from './AvalancheCoreConnector';
import { BitKeepConnector } from './BitKeepConnector';
import { DefiConnector } from './DefiConnector';
import { HashConnector, mainnetHederaConfig } from './HashConnector';
import { NearConnector } from './NearConnector';
import { NetworkConnector } from './NetworkConnector';
import { VenlyConnector } from './Venly';
import { WalletLinkConnector } from './WalletLinkConnector';

export const SUPPORTED_EVM_CHAINS_ID: number[] = ALL_CHAINS.filter(
  (chain) => (chain.pangolin_is_live || chain.supported_by_bridge) && chain?.network_type === NetworkType.EVM,
).map((chain) => chain.chain_id ?? 43114);

// Near Exchnage Contract
export const NEAR_EXCHANGE_CONTRACT_ADDRESS = {
  [ChainId.NEAR_MAINNET]: 'png-exchange-v1.mainnet',
  [ChainId.NEAR_TESTNET]: 'png-exchange-v1.testnet',
};

const urls = Object.entries(CHAINS).reduce((acc, [key, chain]) => {
  acc[key] = chain.rpc_uri;
  return acc;
}, {} as { [x in string]: string });

export const network = new NetworkConnector({
  urls: urls,
  defaultChainId: ChainId.AVALANCHE,
});

let networkLibrary: Web3Provider | undefined;
export function getNetworkLibrary(): Web3Provider {
  networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any);
  return networkLibrary;
}

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_EVM_CHAINS_ID,
});

export const talisman = new TalismanConnector({
  supportedChainIds: SUPPORTED_EVM_CHAINS_ID,
});

export const gnosisSafe = new SafeAppConnector({
  supportedChainIds: SUPPORTED_EVM_CHAINS_ID,
});

export const walletlink = new WalletLinkConnector({
  url: AVALANCHE_MAINNET.rpc_uri,
  supportedChainIds: SUPPORTED_EVM_CHAINS_ID,
  appName: 'Pangolin',
  appLogoUrl: 'https://raw.githubusercontent.com/pangolindex/interface/master/public/images/384x384_App_Icon.png',
});

export const SUPPORTED_XDEFI_CHAINS = [
  ChainId.ETHEREUM,
  ChainId.AURORA,
  ChainId.BSC,
  ChainId.POLYGON,
  ChainId.ARBITRUM,
  ChainId.CRONOS,
  ChainId.AVALANCHE,
  ChainId.FANTOM,
];
export const xDefi = new DefiConnector({
  supportedChainIds: SUPPORTED_XDEFI_CHAINS,
});

export const bitKeep = new BitKeepConnector({
  supportedChainIds: SUPPORTED_EVM_CHAINS_ID,
});

export const venly = new VenlyConnector({
  supportedChainIds: SUPPORTED_EVM_CHAINS_ID,
});

function getNearMainnetConfig() {
  return {
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
    indexerUrl: 'https://indexer.ref-finance.net',
    chainId: ChainId.NEAR_MAINNET,
    contractId: NEAR_EXCHANGE_CONTRACT_ADDRESS[ChainId.NEAR_MAINNET],
  };
}

// TODO: set configuration dynemically as per env
function getNearConfig(env = 'testnet') {
  switch (env) {
    case 'production':
    case 'mainnet':
      return getNearMainnetConfig();

    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://testnet.nearblocks.io',
        chainId: ChainId.NEAR_TESTNET,
        contractId: NEAR_EXCHANGE_CONTRACT_ADDRESS[ChainId.NEAR_TESTNET],
      };
    default:
      return getNearMainnetConfig();
  }
}

export const near = new NearConnector({
  normalizeChainId: false,
  normalizeAccount: false,
  config: getNearConfig('testnet'),
});

export const hashConnect = new HashConnector({
  normalizeChainId: false,
  normalizeAccount: false,
  config: mainnetHederaConfig,
});

export const avalancheCore = new AvalancheCoreConnector({
  supportedChainIds: SUPPORTED_EVM_CHAINS_ID,
});

export { NearConnector, HashConnector };
