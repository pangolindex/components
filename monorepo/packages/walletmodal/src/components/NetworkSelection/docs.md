This component handle how change chain of a connected connector in `@web3-react/core`.

packages required
``` 
@web3-react/core >= 6.0.0 < 8.0.0
```


### How to use

Wrap your react react app with `Web3ReactProvider` and `PangolinProvider`.

```tsx
// index.tsx
import { HoneycombProvider } from '@honeycomb-finance/honeycomb-provider';
import { NetworkContextName, useActiveWeb3React } from '@honeycomb-finance/shared';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import App from './App';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = 15000
  return library
}

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const AppProvider = () => {
  const { library, account, chainId } = useActiveWeb3React();

  return (
    <HoneycombProvider library={library} chainId={chainId} account={account ?? undefined} theme={theme as any}>
        <App />
    </HoneycombProvider>
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
import { NetworkSelection } from '@honeycomb-finance/walletmodal';

export default function Example(){
  const [openNetworkSelection, setOpenNetworkSelection] = useState(false);

  const handleSelectChain = useCallback(
    (chain: Chain) => {
      setOpenNetworkSelection(false);
      // in our examples we close this component and open the Wallet Modal
    },
    [setOpenNetworkSelection],
  );

  return (
    <div>
      <NetworkSelection
        open={openNetworkSelection}
        closeModal={() => {
          setOpenNetworkSelection(false);
        }}
        onToogleWalletModal={handleSelectChain}
      />
    </div>
  ) 
}
```