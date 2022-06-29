import { Web3Provider as Web3ProviderEthers } from '@ethersproject/providers';
import { ChainId } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { PROVIDER_MAPPING, SUPPORTED_WALLETS } from 'src/constants';

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

export function useLibrary(): { library: Web3ProviderEthers; provider: Web3ProviderEthers } {
  const [result, setResult] = useState({} as { library: Web3ProviderEthers; provider: Web3ProviderEthers });

  const { connector } = useWeb3React();

  useEffect(() => {
    async function load() {
      const walletKey = Object.keys(SUPPORTED_WALLETS).find(
        (key) => SUPPORTED_WALLETS[key].connector === connector,
      ) as string;

      const selectedProvider = (await connector?.getProvider()) || window.ethereum;
      const provider = selectedProvider || window.ethereum;
      const extendedProvider = provider && walletKey && (PROVIDER_MAPPING as any)[walletKey]?.(provider);

      let library;

      try {
        library = new Web3ProviderEthers(provider, 'any');
      } catch (error) {
        library = provider;
      }

      setResult({ library, provider: extendedProvider });
    }
    load();
  }, [connector]);

  return result;
}
