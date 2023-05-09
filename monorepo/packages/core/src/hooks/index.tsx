import { Web3Provider as Web3ProviderEthers } from '@ethersproject/providers';
import { ChainId } from '@pangolindex/sdk';
import React, { createContext, useContext } from 'react';

interface Web3State {
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

export default Web3Context;

export const useChainId = () => {
  const { chainId } = usePangolinWeb3();
  return (chainId || ChainId.AVALANCHE) as ChainId;
};
