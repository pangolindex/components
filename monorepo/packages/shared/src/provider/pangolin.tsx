import { getAddress } from '@ethersproject/address';
import { ExternalProvider, Web3Provider as Web3ProviderEthers } from '@ethersproject/providers';
import { ALL_CHAINS, CHAINS, ChainId } from '@pangolindex/sdk';
import { PROVIDER_MAPPING, network } from '@pangolindex/wallet-connectors';
import { useWeb3React } from '@web3-react/core';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { isAddress, isEvmChain } from '../utils';

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
  const state = useMemo(() => {
    let normalizedAccount: typeof account;
    if (chainId) {
      if (isEvmChain(chainId) && isAddress(account)) {
        normalizedAccount = getAddress(account as string);
      } else {
        normalizedAccount = account;
      }
    }

    return {
      library,
      chainId: chainId || ChainId.AVALANCHE,
      account: normalizedAccount,
    };
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
  return (chainId || ChainId.AVALANCHE) as ChainId;
};

export const useChain = (chainId: number) => {
  return ALL_CHAINS.filter((chain) => chain.chain_id === chainId)[0];
};

export const usePngSymbol = () => {
  const { chainId } = usePangolinWeb3();
  return CHAINS[chainId || ChainId.AVALANCHE].png_symbol!;
};

// library -> web3.js/eip-1993/ethers provider
// provider -> ethers.js
// extendedProvider -> extended library

/**
 *
 * @returns { library: ethers.js provider, provider: extended provider }
 */
export function useLibrary(): { library: any; provider: any } {
  const [result, setResult] = useState({} as { library: any; provider: any });

  const { connector } = useWeb3React();
  const chainId = useChainId();
  const { library: userProvidedLibrary } = usePangolinWeb3();

  useEffect(() => {
    async function load() {
      // convert window.ethereum to ethers
      const ethersDefaultProvider = new Web3ProviderEthers((window.ethereum as ExternalProvider) || network.provider);
      // try to wrap connector provider
      const providerFromConnector = await connector?.getProvider();
      let ethersConnectorProvider;
      if (providerFromConnector && !providerFromConnector._isProvider) {
        try {
          ethersConnectorProvider = new Web3ProviderEthers(providerFromConnector as ExternalProvider);
        } catch (error) {
          console.log('==== error ethersConnectorProvider', ethersConnectorProvider, error);
          // error will come incase of Near, Hedera provider
          ethersConnectorProvider = providerFromConnector;
        }
      } else {
        ethersConnectorProvider = providerFromConnector;
      }
      // try to wrap user provided library
      let ethersUserProvidedLibrary = userProvidedLibrary?._isProvider ? userProvidedLibrary : undefined;

      if (userProvidedLibrary && !userProvidedLibrary?._isProvider) {
        try {
          ethersUserProvidedLibrary = new Web3ProviderEthers(userProvidedLibrary as any);
        } catch (error) {
          console.log('==== error ethersUserProvidedLibrary', error);
          ethersUserProvidedLibrary = userProvidedLibrary;
        }
      }

      const finalEthersLibrary = ethersConnectorProvider || ethersUserProvidedLibrary || ethersDefaultProvider;
      const extendedWeb3Provider =
        finalEthersLibrary && (PROVIDER_MAPPING as any)[chainId]?.(finalEthersLibrary, chainId);

      setResult({ library: finalEthersLibrary, provider: extendedWeb3Provider });
    }
    load();
  }, [connector, userProvidedLibrary, chainId]);

  return result;
}
