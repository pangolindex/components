# State-hooks
Contains useful functions, and hooks, used in anothers packages.

## Installation
`yarn add @honeycomb/state-hooks`

or

`npm install @honeycomb/state-hooks`

### Install below dependancies as its peer dependancies

```
@pangolindex/sdk
```

## Development

1. `yarn install`
2. `yarn dev` and keep that terminal running


## Getting Start
In your main file wrap your app with `HoneycombProvider` and `Web3ReactProvider`:

_Use version **6.0.9** of `@web3-react/core` package._

```tsx
import { HoneycombProvider } from '@honeycomb/honeycomb-provider';
import { NetworkContextName, useActiveWeb3React } from '@honeycomb/shared';
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

function getLibrary(provider: any): Web3Provider {
  try {
    const library = new Web3Provider(provider, 'any');
    library.pollingInterval = 15000;
    return library;
  } catch (error) {
    return provider;
  }
}

// library -> web3.js provider
// chainId -> chain id with which user is connected
// account -> user's connected wallet address
// theme -> optional ( refer Theme guide to customize it )
ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <HoneycombProvider library={library} chainId={chainId} account={account} theme={theme}>
          <App />
        </HoneycombProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
```