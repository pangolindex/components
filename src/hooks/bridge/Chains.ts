// import { ChainData } from '@0xsquid/sdk';
import LIFI from '@lifi/sdk';
import { ChainType, EVMChain } from '@lifi/types';
import { Chain, LIFI as LIFIBridge, THORSWAP } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { THORSWAP_API } from 'src/constants';

export function useThorSwapChains() {
  return useQuery(['thorswapChains'], async () => {
    const response = await fetch(`${THORSWAP_API}/universal/chainsDetails`);
    const chains = response && response.status === 200 ? await response.json() : [];
    const formattedChains: Chain[] = chains.map((chain) => {
      return {
        id: `${chain?.displayName.split(' ').join('').toLowerCase()}_mainnet`,
        name: chain?.displayName,
        chain_id: chain?.chainId,
        mainnet: chain?.mainnet,
        evm: chain?.evm,
        pangolin_is_live: false,
        tracked_by_debank: false,
        supported_by_gelato: false,
        rpc_uri: '',
        symbol: chain?.symbol,
        nativeCurrency: {
          name: chain?.gasAsset?.chain,
          symbol: chain?.gasAsset?.symbol,
          decimals: chain?.gasAsset?.decimals,
        },
        logo: chain?.logo,
      };
    });
    return formattedChains;
  });
}

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

// export function useSquidChains() {
//   return useQuery(['squidChains'], async () => {
//     const response = await fetch(`${SQUID_API}/v1/chains`);
//     const chains = response && response.status === 200 ? ((await response.json())?.chains as ChainData[]) : [];

//     const formattedChains: Chain[] = chains.map((chain: ChainData): Chain => {
//       return {
//         id: `${chain?.chainName.toLowerCase()}_mainnet`,
//         name: chain?.chainName,
//         chain_id: isNaN(Number(chain?.chainId)) ? 45672385 : (chain?.chainId as number), //TODO: Random number for now
//         mainnet: true,
//         evm: chain?.chainType === 'evm',
//         pangolin_is_live: false,
//         tracked_by_debank: false,
//         supported_by_gelato: false,
//         rpc_uri: chain.rpc,
//         symbol: chain?.nativeCurrency?.symbol,
//         nativeCurrency: chain?.nativeCurrency,
//         logo: chain?.nativeCurrency?.icon,
//       };
//     });
//     console.log('squid chains after our mapping', formattedChains);
//     return formattedChains;
//   });
// }

export function useBridgeChains() {
  const thorswapChains = useThorSwapChains();
  const lifiChains = useLiFiSwapChains();
  // const squidChains = useSquidChains();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiChains.status === 'success' ? lifiChains?.data ?? [] : [],
      [THORSWAP.id]: thorswapChains.status === 'success' ? thorswapChains?.data ?? [] : [],
      // [SQUID.id]: squidChains.status === 'success' ? squidChains?.data ?? [] : [],
    };
  }, [thorswapChains.status, lifiChains.status]);
}

//TODO: remove this when we have a better way to get the chain data
export function useBridgeChainsAlternativeApproach() {
  const query = useQuery(['allChains'], async () => {
    let data: Chain[] = [];
    const lifi = new LIFI();
    const chains = await lifi.getChains();
    const formattedChainsLifi: Chain[] = chains.map((chain: EVMChain) => {
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

    data = formattedChainsLifi;

    const response = await fetch(`${THORSWAP_API}/universal/chainsDetails`);
    const chainsThorswap = response && response.status === 200 ? await response.json() : [];
    const formattedChainsThor: Chain[] = chainsThorswap.map((chain) => {
      return {
        id: `${chain?.displayName.split(' ').join('').toLowerCase()}_mainnet`,
        name: chain?.displayName,
        chain_id: chain?.chainId,
        mainnet: chain?.mainnet,
        evm: chain?.evm,
        pangolin_is_live: false,
        tracked_by_debank: false,
        supported_by_gelato: false,
        rpc_uri: '',
        symbol: chain?.symbol,
        nativeCurrency: {
          name: chain?.gasAsset?.chain,
          symbol: chain?.gasAsset?.symbol,
          decimals: chain?.gasAsset?.decimals,
        },
        logo: chain?.logo,
      };
    });

    data = data
      .concat(formattedChainsThor)
      .filter((value, index, self) => index === self.findIndex((t) => t.chain_id === value.chain_id));

    // const res = await fetch(`${SQUID_API}/v1/chains`);
    // const squidChains = res && res.status === 200 ? ((await res.json())?.chains as ChainData[]) : [];
    // const formattedSquidChains: Chain[] = squidChains.map((chain: ChainData): Chain => {
    //   return {
    //     id: `${chain?.chainName.toLowerCase()}_mainnet`,
    //     name: chain?.chainName,
    //     chain_id: isNaN(Number(chain?.chainId)) ? 45672385 : (chain?.chainId as number), //TODO: Random number for now
    //     mainnet: true,
    //     evm: chain?.chainType === 'evm',
    //     pangolin_is_live: false,
    //     tracked_by_debank: false,
    //     supported_by_gelato: false,
    //     rpc_uri: chain.rpc,
    //     symbol: chain?.nativeCurrency?.symbol,
    //     nativeCurrency: chain?.nativeCurrency,
    //     logo: chain?.nativeCurrency?.icon,
    //   };
    // });
    // data = data
    //   .concat(formattedSquidChains)
    //   .filter((value, index, self) => index === self.findIndex((t) => t.chain_id === value.chain_id));
    return data;
  });

  return useMemo(() => {
    return {
      ...query,
    };
  }, [query]);
}
