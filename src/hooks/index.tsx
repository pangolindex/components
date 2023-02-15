import { ExternalProvider, Web3Provider as Web3ProviderEthers } from '@ethersproject/providers';
import { CHAINS, ChainId } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { useQueryClient } from 'react-query';
import { hashConnect, network } from 'src/connectors';
import { HashConnectEvents, hashconnectEvent } from 'src/connectors/HashConnector';
import { PROVIDER_MAPPING } from 'src/constants';
import { useDispatch } from 'src/state';
import { setAvailableHashpack } from 'src/state/papplication/actions';
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
  const dispatch = useDispatch();

  const { activate } = useWeb3React();

  // this is special case for hashpack wallet
  // we need to listen for hashpack wallet installed or not event
  // and we are storing this boolean to redux so that
  // in walletModal we can re-render as value updates
  useEffect(() => {
    const emitterFn = (isHashpackAvailable: boolean) => {
      console.log('received hashpack emit event CHECK_EXTENSION in provider', isHashpackAvailable);
      dispatch(setAvailableHashpack(true));
    };
    hashconnectEvent.on(HashConnectEvents.CHECK_EXTENSION, emitterFn);

    // Here when load in iframe  we need to internally activate connector to connect account
    const emitterFnForActivateConnector = (isIframeEventFound: boolean) => {
      console.log('received hashpack emit event ACTIVATE_CONNECTOR in provider', isIframeEventFound);
      activate(hashConnect);
    };
    hashconnectEvent.on(HashConnectEvents.ACTIVATE_CONNECTOR, emitterFnForActivateConnector);

    return () => {
      console.log('removing hashpack CHECK_EXTENSION event listener');
      hashconnectEvent.off(HashConnectEvents.CHECK_EXTENSION, emitterFn);
      console.log('removing hashpack ACTIVATE_CONNECTOR event listener');
      hashconnectEvent.off(HashConnectEvents.ACTIVATE_CONNECTOR, emitterFnForActivateConnector);
    };
  }, []);

  const state = useMemo(() => {
    let normalizedAccount;
    if (chainId) {
      normalizedAccount = CHAINS?.[chainId as ChainId]?.evm ? isAddress(account) : account;
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
      // const walletKey = Object.keys(SUPPORTED_WALLETS).find(
      //   (key) => SUPPORTED_WALLETS[key].connector === connector,
      // ) as string;

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
      const extendedWeb3Provider = finalEthersLibrary && (PROVIDER_MAPPING as any)[chainId]?.(finalEthersLibrary);

      setResult({ library: finalEthersLibrary, provider: extendedWeb3Provider });
    }
    load();
  }, [connector, userProvidedLibrary, chainId]);

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
