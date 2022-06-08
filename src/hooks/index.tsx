import { Web3Provider as Web3ProviderEthers } from '@ethersproject/providers';
import { ChainId } from '@pangolindex/sdk';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { SUPPORTED_WALLETS, PROVIDER_MAPPING } from 'src/constants';
import { useWeb3React } from '@web3-react/core';

interface Web3State {
  library: Web3ProviderEthers | undefined;
  account: string | undefined | null;
  chainId: number | undefined;
}

interface Web3ProviderProps {
  children: ReactNode;
  library: Web3ProviderEthers | undefined;
  account: string | undefined | null;
  chainId: number | undefined;
}

const initialWeb3State: Web3State = {
  library: undefined,
  chainId: undefined,
  account: undefined,
};

const Web3Context = createContext<Web3State>({} as Web3State);

export const usePangolinWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('usePangolinWeb3 must be used within a component wrapped with PangolinWeb3Provider');
  }
  return context;
};

export const PangolinWeb3Provider: FC<Web3ProviderProps> = ({
  children,
  library,
  chainId,
  account,
}: Web3ProviderProps) => {
  const [state, setState] = useState<Web3State>(initialWeb3State);

  useEffect(() => {
    setState({
      library,
      chainId: chainId || ChainId.AVALANCHE,
      account,
    });
  }, [library, chainId, account]);

  return (
    <Web3Context.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;

export const useChainId = () => {
  const { chainId } = usePangolinWeb3();
  return chainId || ChainId.AVALANCHE;
};

// export function useLibrary(): { library: Web3ProviderEthers; provider: Web3ProviderEthers } {
//   const { connector } = useWeb3React();

//   return useMemo(() => {
//     const selectedWallet = Object.values(SUPPORTED_WALLETS).find((wallet) => wallet.connector === connector);

//     const provider = selectedWallet?.provider || window.ethereum;

//     const library = new Web3ProviderEthers(provider, 'any');
//     library.pollingInterval = 15000;

//     console.log('provider', provider);

//     return { library, provider };
//   }, [connector]);
// }

export function useLibrary(): { library: Web3ProviderEthers; provider: Web3ProviderEthers } {
  const [result, setResult] = useState({} as { library: Web3ProviderEthers; provider: Web3ProviderEthers });

  const { connector } = useWeb3React();

  useEffect(() => {
    async function load() {
      const walletKey = Object.keys(SUPPORTED_WALLETS).find(
        (key) => SUPPORTED_WALLETS[key].connector === connector,
      ) as string;

      const selectedProvider = (await connector?.getProvider()) || window.ethereum;
      let provider = selectedProvider || window.ethereum;
      const extendedProvider = provider && walletKey && (PROVIDER_MAPPING as any)[walletKey]?.(provider);

      const library = new Web3ProviderEthers(provider, 'any');

      setResult({ library, provider: extendedProvider });
    }
    load();
  }, [connector]);

  return result;
}
