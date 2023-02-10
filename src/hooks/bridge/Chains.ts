import { ChainData, Squid } from '@0xsquid/sdk';
import LIFI from '@lifi/sdk';
import { EVMChain } from '@lifi/types';
import { BridgeChain, LIFI as LIFIBridge, NetworkType, RANGO, SQUID } from '@pangolindex/sdk';
import {
  BlockchainMeta as RangoChainMeta,
  TransactionType as RangoChainType,
  RangoClient,
  EvmBlockchainMeta as RangoEvmChainMeta,
  TransactionType,
} from 'rango-sdk-basic';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { RANGO_API_KEY, SQUID_API } from 'src/constants';

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
        pangolin_is_live: false,
        tracked_by_debank: false,
        supported_by_gelato: false,
        supported_by_bridge: chain?.mainnet, // only if chain is mainnet
        rpc_uri: chain?.metamask?.rpcUrls[0],
        symbol: chain?.metamask?.nativeCurrency?.symbol,
        nativeCurrency: chain?.metamask?.nativeCurrency,
        logo: chain?.logoURI,
      } as BridgeChain;
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

    const formattedChains: (BridgeChain | undefined)[] = chains.map((chain: ChainData): BridgeChain | undefined => {
      // We have to make sure that we don't include EVMOS as it is already included in the RangoSwap chains
      if (chain?.chainName.toLocaleUpperCase() === 'EVMOS') return;
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
        pangolin_is_live: false,
        tracked_by_debank: false,
        supported_by_gelato: false,
        supported_by_bridge: true,
        supported_by_twap: false,
        rpc_uri: chain.rpc,
        symbol: chain?.nativeCurrency?.symbol,
        nativeCurrency: chain?.nativeCurrency,
        logo: chain?.nativeCurrency?.icon,
      } as BridgeChain;
    });
    return formattedChains.filter((chain) => chain !== undefined) as BridgeChain[];
  });
}

export function useRangoChains() {
  return useQuery(['rangoChains'], async () => {
    const rango = new RangoClient(RANGO_API_KEY);
    const chains = await rango.chains();
    const isEvmBlockchain = (blockchainMeta: RangoChainMeta): blockchainMeta is RangoEvmChainMeta =>
      blockchainMeta.type === TransactionType.EVM;
    const evmChains: RangoEvmChainMeta[] = chains.filter(isEvmBlockchain);

    const formattedChains: BridgeChain[] = evmChains?.map((chain: RangoEvmChainMeta) => {
      return {
        id: `${chain.name.toLowerCase()}_mainnet`,
        network_type: NetworkType.EVM,
        name: chain.name,
        chain_id: parseInt(chain.chainId || '1'),
        mainnet: true,
        evm: chain.type === RangoChainType.EVM,
        pangolin_is_live: false,
        tracked_by_debank: false,
        supported_by_gelato: false,
        supported_by_bridge: true,
        supported_by_twap: false,
        rpc_uri: chain.info.rpcUrls[0],
        symbol: chain.info.nativeCurrency.symbol,
        nativeCurrency: chain.info.nativeCurrency,
        logo: chain.logo,
      } as BridgeChain;
    });
    return formattedChains;
  });
}

export function useBridgeChains() {
  const lifiChains = useLiFiSwapChains();
  const rangoChains = useRangoChains();
  const squidChains = useSquidChains();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiChains.status === 'success' ? lifiChains?.data ?? [] : [],
      [SQUID.id]: squidChains.status === 'success' ? squidChains?.data ?? [] : [],
      [RANGO.id]: rangoChains.status === 'success' ? rangoChains?.data ?? [] : [],
    };
  }, [lifiChains.status, squidChains.status, rangoChains.status]);
}
