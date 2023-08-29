# Pangolin Wallet Connectors
This package contains connectors that are used to help connect wallets in react apps.

## Installation
`yarn add @pangolindex/wallet-connectors`

or

`npm install @pangolindex/wallet-connectors`

## Getting Start
This is used together with `@web3-react`, where the connector is activated and deactivated

```tsx
import { InjectedConnector } from "@pangolindex/wallet-connectors";

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