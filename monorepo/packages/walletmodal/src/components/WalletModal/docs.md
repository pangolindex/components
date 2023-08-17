This component handles connection with wallets.

packages required
```
@web3-react/core >= 6.0.0 < 8.0.0
```

## How to use

Wrap your react app with `Web3ReactProvider` and `PangolinProvider`.

```tsx
// index.tsx
import { PangolinProvider, NetworkContextName, useActiveWeb3React } from '@pangolindex/components';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import App from './App';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = 15000
  return library;
}

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const AppProvider = () => {
  const { library, account, chainId } = useActiveWeb3React();

  return (
    <PangolinProvider library={library} chainId={chainId} account={account ?? undefined} theme={theme as any}>
        <App />
    </PangolinProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <AppProvider />
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
```

You can now use the component in your application.

```tsx
// example.tsx
import { WalletModal } from '@pangolindex/components';

export default function Example(){
  const [open, setOpen] = useState(false);

  return (
    <div>
      <WalletModal
        open={open}
        closeModal={() => {
          setOpen(false);
        }}
        onWalletConnect={() => {
          setOpen(false);
        }}
      />
    </div>
  ) 
}
```

#### Supported Wallet by default

- Inject Wallet (Wallet that injects the ethereum object into the window, compatible with [eip 1193](https://eips.ethereum.org/EIPS/eip-1193))
- [Metamask](https://metamask.io/)
- [Core Wallet](https://core.app/)
- [HashPack](https://www.hashpack.app/)
- [Rabby Wallet](https://rabby.io/)
- [Talisman](https://www.talisman.xyz/)
- [BitKeep](https://bitkeep.com/)
- [XDEFI](https://www.xdefi.io/)
- [Safe Wallet](https://safe.global/)
- [Coinbase Wallet](https://www.coinbase.com/wallet)
- [WalletConnect](https://walletconnect.com/) (need extra steps [see bellow](#how-to-add-custom-chains))

#### Supported Chains by default

The component supports wallets where it is in the[ CHAINS mapping in the sdk](https://github.com/pangolindex/sdk/blob/b4207d1cc32feb2caa9f6a48f466cf88bb57a219/src/chains.ts#LL2057C2-L2057C2) and pangolin_is_active and supported_by_bridge is **true**


## How to add custom wallets

You need extends the ```PangolinWallet class``` and edit the methods or you can use an existing wallet in our components.

**The supportedWallets parameter will override the default supported wallets above**

```tsx
import { PangolinWallet, PangolinInjectedWallet } from "@pangolindex/components";

class CustomWallet extends PangolinWallet{
  constructor() {
    super({
      connector: walletConnector, // AbstractConnector from @web3-react/abstract-connector
      name: 'custom name',
      href: 'web site url',
      icon: 'icon ',
      description: ' description',
      supportedChains: [NetworkType.EVM], // Which chains your wallet support
      supportedChainsId: [1, 43114], // Which chains id your wallet support
    });
  }
}

const customInjected = new PangolinInjectedWallet({
  name: 'custom injected',
  href: 'web site url',
  icon: 'icon ',
  description: ' description',
  supportedChains: [NetworkType.EVM],
  supportedChainsId: [1],
  walletKey: 'isCustomInjectedWallet',
  conditionToShowWallet: () => !isMobile,
});

export default function Example(){
  const [open, setOpen] = useState(false);

  const supportedWallets = {
    CUSTOM: new CustomWallet(),
    CUSTOMINJECTED: customInjected,
  };

  return (
    <div>
      <WalletModal
        open={open}
        closeModal={() => {
          setOpen(false);
        }}
        onWalletConnect={() => {
          setOpen(false);
        }}
        supportedWallets={supportedWallets}
      />
    </div>
  );
}
```

## How to add custom chains

Create a new object that satisfies Chain interface

```tsx
import { Chain } from "@pangolindex/sdk";

const customChain = {
  id: "custom_id",
  name: "custom",
  ...
} as const satisfies Chain;

export default function Example(){
  const [open, setOpen] = useState(false);

  const supportedChains = [customChain];

  return (
    <div>
      <WalletModal
        open={open}
        closeModal={() => {
          setOpen(false);
        }}
        onWalletConnect={() => {
          setOpen(false);
        }}
        supportedChains={supportedChains}
      />
    </div>
  );
}
```

## How to use WalletConnet

You need do import `PangolinWalletConnectWallet` and create a new object and add it on supportedWallets mapping 

```tsx
import { PangolinWalletConnectWallet } from "@pangolindex/components";

const walletConnect = new PangolinWalletConnectWallet({
  rpcMap: rpcs,
  projectId: "walletconnnect project id here",
  metadata: {
    name: '',
    description: '',
    url:'',
    icons: [''],
  },
});


export default function Example(){
  const [open, setOpen] = useState(false);

  const supportedWallets = {
    WALLET_CONNECT: walletConnect,
  };

  return (
    <div>
      <WalletModal
        open={open}
        closeModal={() => {
          setOpen(false);
        }}
        onWalletConnect={() => {
          setOpen(false);
        }}
        supportedWallets={supportedWallets}
      />
    </div>
  );
}
```