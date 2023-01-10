import { ChainData, Squid } from '@0xsquid/sdk';
import LIFI from '@lifi/sdk';
import { ChainType, EVMChain } from '@lifi/types';
import { BridgeChain, LIFI as LIFIBridge, NetworkType, SQUID } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { SQUID_API } from 'src/constants';

export function useLiFiSwapChains() {
  return useQuery(['lifiChains'], async () => {
    const lifi = new LIFI();
    const chains = await lifi.getChains();
    const formattedChains: BridgeChain[] = chains.map((chain: EVMChain) => {
      return {
        id: `${chain?.name.toLowerCase()}_mainnet`,
        network_type: NetworkType.EVM,
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

export function useSquidChains() {
  return useQuery(['squidChains'], async () => {
    const squid = new Squid({
      baseUrl: SQUID_API,
    });
    await squid.init();
    const chains = squid.chains as ChainData[];

    const formattedChains: BridgeChain[] = chains.map((chain: ChainData): BridgeChain => {
      return {
        id: `${chain?.chainName.toLowerCase()}_mainnet`,
        network_type: chain?.chainType === 'evm' ? NetworkType.EVM : NetworkType.COSMOS,
        ...('bech32Config' in chain && {
          meta_data: {
            cosmosPrefix: chain?.bech32Config?.bech32PrefixAccAddr,
          },
        }),
        name: chain?.chainName.charAt(0).toLocaleUpperCase() + chain?.chainName.slice(1),
        chain_id: chain?.chainId,
        mainnet: true,
        evm: chain?.chainType === 'evm',
        pangolin_is_live: false,
        tracked_by_debank: false,
        supported_by_gelato: false,
        rpc_uri: chain.rpc,
        symbol: chain?.nativeCurrency?.symbol,
        nativeCurrency: chain?.nativeCurrency,
        logo: chain?.nativeCurrency?.icon,
      };
    });
    return formattedChains;
  });
}

export function useBridgeChains() {
  const lifiChains = useLiFiSwapChains();
  const squidChains = useSquidChains();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiChains.status === 'success' ? lifiChains?.data ?? [] : [],
      [SQUID.id]: squidChains.status === 'success' ? squidChains?.data ?? [] : [],
    };
  }, [lifiChains.status, squidChains.status]);
}
