# Pangolin Wallet Connectors
This package contains connectors that are used to help connect wallets in react apps.

## Installation
`yarn add @pangolindex/wallet-connectors`

or

`npm install @pangolindex/wallet-connectors`

## Getting Start
This is used together with `@web3-react/core`, where the connector is activated and deactivated.

_Use version **6.0.9** of `@web3-react/core` package._

```tsx
import { InjectedConnector } from "@pangolindex/wallet-connectors";
import { useWeb3React } from '@web3-react/core';

const metamaskConnector = new InjectedConnector({
    supportedChainIds: [1,2,3],
});

export function ExampleComponent(){
    const { activate, deactivate, active } = useWeb3React();

    const onActivate = async () => {
        await activate(metamaskConnector, undefined, false); 
    };

    return (
        <div>
            <button onClick={onActivate}>
                Connect
            </button>
            <button onClick={deactivate} disabled={!active}>
                Disconnect
            </button>
        </div>
    )
};
```

Now you can use the connector in another component in your app.

```tsx
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';

export function ExampleComponent(){
    const { connector } = useWeb3React();

    const [provider, setProvider] = useState<any>(null);
    const [chainId, setChainId] =  usestate<number | null>(null);
    const [account, setAccount] =  usestate<string | null>(null);

    useEffect(() => {
        const getInfo = async() => {
            const _provider = await connector.getProvider();
            const _chainId = await connector.getChainId();
            const _account = await connector.getAccount();

            setProvider(_provider);
            setChainId(_chainId);
            setAccount(_account);
        };

        getInfo();
    }, [connector]);

    return (
        <div>
            <div>Connected account: {account}</div>
            <div>Connected chainId: {chainId}</div>
        </div>
    )
};
```