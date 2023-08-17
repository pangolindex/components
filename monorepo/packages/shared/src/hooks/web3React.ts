import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import { NetworkContextName } from '../constants';
import { ChainId } from '@pangolindex/sdk';

interface Web3ReactContextInterface<T = any> {
  activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void>;
  setError: (error: Error) => void;
  deactivate: () => void;
  connector?: AbstractConnector;
  library?: T;
  chainId?: number;
  account?: null | string;
  active: boolean;
  error?: Error;
}

/**
 * This hook return the active web3-react context
 *
 * Is active network context or any context
 *
 * @returns return the active web3-react context
 */
export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3React<Web3Provider>();
  const contextNetwork = useWeb3React<Web3Provider>(NetworkContextName);
  return context.active ? context : contextNetwork;
}
