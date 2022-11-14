import LIFI from '@lifi/sdk';
import { ChainType, EVMChain } from '@lifi/types';
import { Chain, LIFI as LIFIBridge } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

export function useLiFiSwapChains() {
  return useQuery(['lifiChains'], async () => {
    const lifi = new LIFI();
    const chains = await lifi.getChains();
    const formattedChains: Chain[] = chains.map((chain: EVMChain) => {
      return {
        id: `${chain?.name.toLowerCase()}_mainnet`,
        name: chain?.name,
        chain_id: chain?.id,
        mainnet: chain?.mainnet,
        evm: chain?.chainType === ChainType.EVM,
        pangolin_is_live: false,
        tracked_by_debank: false,
        supported_by_gelato: false,
        rpc_uri: chain?.metamask?.rpcUrls[0],
        symbol: chain?.metamask?.nativeCurrency?.symbol,
        nativeCurrency: chain?.metamask?.nativeCurrency,
        logo: chain?.logoURI,
      };
    });
    return formattedChains;
  });
}

export function useBridgeChains() {
  const lifiChains = useLiFiSwapChains();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiChains.status === 'success' ? lifiChains?.data ?? [] : [],
    };
  }, [lifiChains.status]);
}
