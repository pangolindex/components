import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';
import { ALL_CHAINS, AVALANCHE_MAINNET, CHAINS, ChainId, NetworkType } from '@pangolindex/sdk';
import { TalismanConnector } from '@talismn/web3react-v6-connector';
import { AvalancheCoreConnector } from './AvalancheCoreConnector';
import { BitKeepConnector } from './BitKeepConnector';
import { DefiConnector } from './DefiConnector';
import { HashConnectEvents, HashConnector, hashconnectEvent } from './HashConnector';
import {
  FunctionCallOptions as NearFunctionCallOptions,
  NearTransaction,
  NearTokenMetadata,
} from './NearConnector/types';
import { NetworkConnector } from './NetworkConnector';
import { VenlyConnector } from './Venly';
import { WalletConnectConnector, WalletConnectConnectorArguments } from './WalletConnectConnector';
import { WalletLinkConnector } from './WalletLinkConnector';
import { InjectedConnector, NoEthereumProviderError, UserRejectedRequestError } from './Web3ReactInjectedConnector';

export const SUPPORTED_EVM_CHAINS_ID: number[] = ALL_CHAINS.filter(
  (chain) => (chain.pangolin_is_live || chain.supported_by_bridge) && chain?.network_type === NetworkType.EVM,
).map((chain) => chain.chain_id ?? 43114);

const urls = Object.entries(CHAINS).reduce((acc, [key, chain]) => {
  acc[key] = chain.rpc_uri;
  return acc;
}, {} as { [x in string]: string });

export const network = new NetworkConnector({
  urls: urls,
  defaultChainId: ChainId.AVALANCHE,
});

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

export const avalancheCore = new AvalancheCoreConnector({
  supportedChainIds: SUPPORTED_EVM_CHAINS_ID,
});

export { HashConnector, HashConnectEvents, hashconnectEvent, WalletConnectConnector, NetworkConnector };
export { UserRejectedRequestError, NoEthereumProviderError };
export type { WalletConnectConnectorArguments, NearTransaction, NearFunctionCallOptions, NearTokenMetadata };

export * from './NearConnector/near';
export * from './HashConnector/hedera';
export * from './constants';
