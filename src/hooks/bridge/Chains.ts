import { ChainData, Squid } from '@0xsquid/sdk';
import LIFI from '@lifi/sdk';
import { ChainType, EVMChain } from '@lifi/types';
import {
  ALL_CHAINS,
  BridgeChain,
  Chain,
  HASHPORT,
  HEDERA_MAINNET,
  HEDERA_TESTNET,
  LIFI as LIFIBridge,
  NetworkType,
  SQUID,
} from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { HASHPORT_API, SQUID_API } from 'src/constants';

export function useLiFiSwapChains() {
  return useQuery(['lifiChains'], async () => {
    const lifi = new LIFI();
    const chains = await lifi.getChains();
    const formattedChains: BridgeChain[] = chains.map((chain: EVMChain) => {
      const relatedChain = ALL_CHAINS.find((c: Chain) => c.chain_id?.toString() === chain?.id.toString()) as Chain;
      return {
        id: `${chain?.name.toLowerCase()}_mainnet`,
        network_type: NetworkType.EVM,
        name: chain?.name,
        chain_id: chain?.id,
        mainnet: chain?.mainnet,
        evm: chain?.chainType === ChainType.EVM,
        ...(relatedChain && {
          coingecko_id: relatedChain?.coingecko_id,
          pangolin_is_live: relatedChain?.pangolin_is_live,
          tracked_by_debank: relatedChain?.tracked_by_debank,
          supported_by_gelato: relatedChain?.supported_by_gelato,
        }),
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
      const relatedChain = ALL_CHAINS.find((c: Chain) => c.chain_id?.toString() === chain?.chainId.toString()) as Chain;
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
        ...(relatedChain && {
          coingecko_id: relatedChain?.coingecko_id,
          pangolin_is_live: relatedChain?.pangolin_is_live,
          tracked_by_debank: relatedChain?.tracked_by_debank,
          supported_by_gelato: relatedChain?.supported_by_gelato,
        }),
        rpc_uri: chain.rpc,
        symbol: chain?.nativeCurrency?.symbol,
        nativeCurrency: chain?.nativeCurrency,
        logo: chain?.nativeCurrency?.icon,
      };
    });
    return formattedChains;
  });
}

export function useHashportChains() {
  return useQuery(['hashportChains'], async () => {
    const response = await fetch(`${HASHPORT_API}/networks`);
    const chains = response && response.status === 200 ? await response.json() : [];
    const formattedChains: BridgeChain[] = chains.map((chain) => {
      // We have to add below line, because Hashport doesn't give enough data via API
      const relatedChain = ALL_CHAINS.find((c: Chain) => c.chain_id?.toString() === chain?.id.toString()) as Chain;
      return {
        id: relatedChain?.id,
        name: relatedChain?.name,
        network_type: relatedChain !== (HEDERA_MAINNET || HEDERA_TESTNET) ? NetworkType.EVM : NetworkType.HEDERA, // TODO: Remove TESTNET
        chain_id: relatedChain?.chain_id,
        mainnet: relatedChain?.mainnet,
        evm: relatedChain?.evm,
        coingecko_id: relatedChain?.coingecko_id,
        pangolin_is_live: relatedChain?.pangolin_is_live,
        tracked_by_debank: relatedChain?.tracked_by_debank,
        supported_by_gelato: relatedChain?.supported_by_gelato,
        nativeCurrency: relatedChain?.nativeCurrency,
        rpc_uri: relatedChain?.rpc_uri,
        symbol: relatedChain?.symbol,
        logo: relatedChain?.logo,
      };
    });
    return formattedChains;
  });
}

export function useBridgeChains() {
  const lifiChains = useLiFiSwapChains();
  const squidChains = useSquidChains();
  const hashportChains = useHashportChains();

  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiChains.status === 'success' ? lifiChains?.data ?? [] : [],
      [SQUID.id]: squidChains.status === 'success' ? squidChains?.data ?? [] : [],
      [HASHPORT.id]: hashportChains.status === 'success' ? hashportChains?.data ?? [] : [],
    };
  }, [lifiChains.status, squidChains.status, hashportChains.status]);
}
