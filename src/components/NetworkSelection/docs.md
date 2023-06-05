This component handle how change chain of a connected connector in `@web-react`.

### How to use

Wrap your react with `Web3ReactProvider` and `PangolinProvider`.

```tsx
// index.tsx
import { PangolinProvider } from '@pangolindex/components';
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import App from './App';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = 15000
  return library
}

const AppProvider = () => {
  const { library, account, chainId } = useWeb3React<Web3Provider>();

  return (
    <PangolinProvider library={library} chainId={chainId} account={account ?? undefined} theme={theme as any}>
        <App />
    </PangolinProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <AppProvider />
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
```

You can now use the component in your application.

```tsx
// example.tsx
import { NetworkSelection } from '@pangolindex/components';

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