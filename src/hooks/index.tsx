import { Web3Provider as Web3ProviderEthers } from '@ethersproject/providers';
import { CHAINS, ChainId } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { useQueryClient } from 'react-query';
import { PROVIDER_MAPPING } from 'src/constants';
import { useBlockNumber } from 'src/state/papplication/hooks';
import { isAddress } from 'src/utils';

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
    let normalizedAccount;
    if (chainId) {
      normalizedAccount = CHAINS?.[chainId as ChainId]?.evm ? isAddress(account) : account;
    }

    setState({
      library,
      chainId: chainId || ChainId.AVALANCHE,
      account: normalizedAccount,
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
  return (chainId || ChainId.AVALANCHE) as ChainId;
};

// library -> web3.js
// provider -> ethers.js
// extendedProvider -> extended library

export function useLibrary(): { library: any; provider: any } {
  const [result, setResult] = useState({} as { library: any; provider: any });

  const { connector } = useWeb3React();
  const chainId = useChainId();
  const { library: userProvidedLibrary } = usePangolinWeb3();

  useEffect(() => {
    async function load() {
      // const walletKey = Object.keys(SUPPORTED_WALLETS).find(
      //   (key) => SUPPORTED_WALLETS[key].connector === connector,
      // ) as string;

      const web3jsProvider = (await connector?.getProvider()) || userProvidedLibrary || window.ethereum;
      const finalWeb3jsProvider = web3jsProvider || window.ethereum;
      const extendedWeb3Provider = finalWeb3jsProvider && (PROVIDER_MAPPING as any)[chainId]?.(finalWeb3jsProvider);

      let finalEthersLibrary;

      try {
        finalEthersLibrary = new Web3ProviderEthers(finalWeb3jsProvider, 'any');
      } catch (error) {
        finalEthersLibrary = finalWeb3jsProvider;
      }

      setResult({ library: finalEthersLibrary, provider: extendedWeb3Provider });
    }
    load();
  }, [connector]);

  return result;
}

export const useRefetchMinichefSubgraph = () => {
  const { account } = usePangolinWeb3();
  const queryClient = useQueryClient();

  return async () => await queryClient.refetchQueries(['get-minichef-farms-v2', account]);
};

export function useGetBlockTimestamp(blockNumber?: number) {
  const latestBlockNumber = useBlockNumber();
  const _blockNumber = blockNumber ?? latestBlockNumber;

  const { provider } = useLibrary();

  const [timestamp, setTimestamp] = useState<string | undefined>(undefined);

  const getTimestamp = useMemo(async () => {
    if (!_blockNumber || !provider) return;

    const result = await (provider as any)?.getBlockTimestamp(_blockNumber);
    return result;
  }, [_blockNumber, provider]);

  useEffect(() => {
    const getResult = async () => {
      const result = await getTimestamp;
      setTimestamp(result);
    };
    getResult();
  }, [_blockNumber, getTimestamp]);

  return timestamp;
}
