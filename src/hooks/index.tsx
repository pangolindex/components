// import { Web3Provider } from '@ethersproject/providers'
// import { ChainId } from '@pangolindex/sdk'
// import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
// import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
// import {  NetworkContextName } from 'src/constants'

// export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
//   const context = useWeb3ReactCore<Web3Provider>()
//   const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
//   return context.active ? context : contextNetwork
// }

import { Web3Provider as Web3ProviderEthers } from '@ethersproject/providers';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
// import { Handler } from '@gelatonetwork/limit-orders-lib';

interface Web3State {
  library: Web3ProviderEthers | undefined;
  account: string | undefined | null;
  chainId: number | undefined;
  // handler?: Handler;
  // toggleWalletModal?: () => void;
}

interface Web3ProviderProps {
  children: ReactNode;
  library: Web3ProviderEthers | undefined;
  account: string | undefined | null;
  chainId: number | undefined;
  // handler?: Handler;
  // toggleWalletModal?: () => void;
}

const initialWeb3State: Web3State = {
  library: undefined,
  chainId: undefined,
  account: undefined,
  // handler: undefined,
  // toggleWalletModal: undefined,
};

const Web3Context = createContext<Web3State>({} as Web3State);

export const useActiveWeb3React = () => useContext(Web3Context);

export const Web3Provider: FC<Web3ProviderProps> = ({
  children,
  library,
  chainId,
  account,
}: // handler,
// toggleWalletModal,
Web3ProviderProps) => {
  const [state, setState] = useState<Web3State>(initialWeb3State);

  useEffect(() => {
    setState({
      library,
      chainId,
      account,
      // handler,
      // toggleWalletModal,
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
