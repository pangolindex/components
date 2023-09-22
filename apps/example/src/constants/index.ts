import { SUPPORTED_EVM_CHAINS_ID } from '@honeycomb-finance/wallet-connectors';
import { HoneycombWallet, HoneycombWalletConnectWallet, SUPPORTED_WALLETS } from '@honeycomb-finance/walletmodal';
import { CHAINS, ChainId } from '@pangolindex/sdk';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECTID;

export const supportedWallets: { [key: string]: HoneycombWallet } = {
  ...SUPPORTED_WALLETS,
};

if (walletConnectProjectId) {
  const rpcs = SUPPORTED_EVM_CHAINS_ID.reduce((acc, chainId) => {
    const rpc: string | undefined = CHAINS[chainId as ChainId]?.rpc_uri;

    if (rpc) {
      acc[chainId] = rpc;
    }
    return acc;
  }, {} as { [chainId in number]: string });

  const walletConnectWallet = new HoneycombWalletConnectWallet({
    rpcMap: rpcs,
    projectId: walletConnectProjectId,
    metadata: {
      name: 'Pangolin',
      description: 'Pangolin Dapp',
      url: window.location.host,
      icons: ['https://raw.githubusercontent.com/pangolindex/interface/master/public/images/384x384_App_Icon.png'],
    },
  });

  supportedWallets['WALLLET_CONNECT'] = walletConnectWallet;
}
