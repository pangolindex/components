import { CHAINS, Chain, ChainId, NetworkType } from '@pangolindex/sdk';
import { wait } from '@pangolindex/shared';
import { HashConnector, NetworkConnector } from '@pangolindex/wallet-connectors';
import { AbstractConnector } from '@web3-react/abstract-connector';
import deepEqual from 'deep-equal';
import { injectWallet } from 'src/wallet';
import { Wallet, activeFunctionType } from 'src/wallet/classes/wallet';

export function getWalletKey(wallet: Wallet, walletMapping: { [x: string]: Wallet }): string | null {
  const result = Object.entries(walletMapping).find(([, value]) => deepEqual(value, wallet));

  if (result) {
    return result[0];
  }
  return null;
}

export function disconnectWallets(wallets: Wallet[]) {
  wallets.forEach((wallet) => {
    if (wallet.isActive) {
      wallet.disconnect();
      console.debug('Wallet disconnected ', wallet);
    }
  });
}

export function getInstalledEvmWallet(wallets: Wallet[]) {
  // skip injected wallet
  return wallets.filter(
    (wallet) =>
      wallet.supportedChains.includes(NetworkType.EVM) && wallet.installed() && !deepEqual(wallet, injectWallet),
  );
}

/**
 * This function request the wallet provider to change the chain
 * @param chain Chain to be changed
 * @param connector The connector, injected, haspack, etc. Instance of AbstractConnector
 * @param wallets array of wallets used in app
 * @param callBack Callback function to executed on success
 * @param activate function provide by @web3/react to active the connector
 * @param deactivate function provide by @web3/react to deactive the connector
 */
export async function changeNetwork(args: {
  chain: Chain;
  connector: AbstractConnector;
  wallets: Wallet[];
  callBack?: () => void;
  activate: activeFunctionType;
  deactivate: () => void;
}) {
  const { chain, connector, wallets, callBack, deactivate, activate } = args;

  const chainId = await connector.getChainId().then((chainId) => {
    return Number(chainId);
  });

  // avoid unecessary change network to same connected network
  if (chain.chain_id === chainId) {
    return;
  }

  if (connector instanceof NetworkConnector) {
    connector.changeChain(chain.chain_id ?? 43114);
    return;
  }

  const connectedChain = CHAINS[chainId];
  let deactivatedWallet = false;
  // we need to deactivate the web3react when user change for another chain type or
  // when user want to change to any hedera network
  if (connectedChain.network_type !== chain.network_type) {
    deactivate();
    deactivatedWallet = true;
    await wait(500);
  }

  switch (chain.network_type) {
    case NetworkType.EVM:
      let walletProvider: any;
      // if we leave a chain for example hedera for avalanche (evm)
      // we need to change wallets so we deactivate web3react and activate an evm wallet
      if (deactivatedWallet) {
        const evmWallets = getInstalledEvmWallet(wallets);
        if (wallets.length > 0) {
          for (let index = 0; index < evmWallets.length; index++) {
            try {
              const wallet = evmWallets[index];
              await wallet.tryActivation({ activate });
              walletProvider = await wallet.connector.getProvider();
              // break the loop when user accepts the wallet connection
              if (walletProvider) {
                break;
              }
            } catch {
              continue;
            }
          }
        } else {
          // if there is no evm wallet installed, we need to exit the
          // function so that nothing breaks
          return;
        }
      } else {
        // if the chain is still evm we request the change of chain
        walletProvider = await connector.getProvider();
      }

      // if the user does not accept the connection, we exit the function
      if (walletProvider === undefined) {
        return;
      }

      try {
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chain?.chain_id?.toString(16)}` }],
        });
        callBack && callBack();
        return;
      } catch {
        try {
          await walletProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: chain.name,
                chainId: `0x${chain?.chain_id?.toString(16)}`,
                //nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpc_uri],
                blockExplorerUrls: chain.blockExplorerUrls,
                iconUrls: chain.logo,
                nativeCurrency: chain.nativeCurrency,
              },
            ],
          });
          callBack && callBack();
          return;
        } catch {
          return;
        }
      }
    case NetworkType.HEDERA:
      if (connector instanceof HashConnector) {
        await connector.changeChain(chain.chain_id ?? ChainId.HEDERA_MAINNET);
        callBack && callBack();
      }
      return;
    case NetworkType.NEAR:
    // TODO: change this to similar to hedera when we get close to releasing hedera
    case NetworkType.COSMOS:
    case NetworkType.SUBNET: // subnet is secundary type, so when can skip this
    default:
      return;
  }
}

/**
 * This function handle the chain change, if wallet not support this change open the wallet modal
 * @param chain Chain to be changed
 * @param wallets array of wallets used in app
 * @param connector The connector, injected, haspack, etc. Instance of AbstractConnector
 * @param account
 * @param activate function provide by @web3/react to active the connector
 * @param deactivate function provide by @web3/react to deactive the connector
 * @param onToogleWalletModal function to open wallet modal
 */
export async function onChangeNetwork({
  chain,
  wallets,
  connector,
  account,
  activate,
  deactivate,
  onToogleWalletModal,
}: {
  chain: Chain;
  wallets: Wallet[];
  connector: AbstractConnector;
  account: string | null | undefined;
  activate: activeFunctionType;
  deactivate: () => void;
  onToogleWalletModal: (chain: Chain) => void;
}) {
  const activeWallet = wallets.find((wallet) => wallet.isActive);

  // if there is no wallet active or an account in app state we can change the chain
  // because the connector is NetworkConnector and we can change chain of it
  if ((!activeWallet || !account) && connector instanceof NetworkConnector) {
    await changeNetwork({
      chain,
      connector,
      wallets,
      activate,
      deactivate,
    });
    return;
  }

  // if don't have active wallet or a connector
  // or the active wallet don't support this chain
  // we need to open the wallet modal to select a chain
  if (
    !activeWallet ||
    !connector ||
    !activeWallet.supportedChains.includes(chain.network_type) ||
    (!!activeWallet.supportedChainsId && !activeWallet.supportedChainsId.includes(chain.chain_id ?? 0))
  ) {
    onToogleWalletModal(chain);
    return;
  }

  // if wallet support this chain we can request to wallet and
  // connector to change the chain
  await changeNetwork({
    chain,
    connector,
    wallets,
    activate,
    deactivate,
  });
}
