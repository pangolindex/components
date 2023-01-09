import { Squid, TokenData } from '@0xsquid/sdk';
import LIFI from '@lifi/sdk';
import { Token } from '@lifi/types';
import { BridgeCurrency, HASHPORT, LIFI as LIFIBridge, SQUID } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { HASHPORT_API, SQUID_API } from 'src/constants';

export function useLiFiSwapCurrencies() {
  return useQuery(['lifiCurrencies'], async () => {
    const lifi = new LIFI();
    const data = await lifi.getTokens();
    let formattedCurrencies: BridgeCurrency[] = [];

    Object.entries(data?.tokens).forEach(([chainId, tokens]) => {
      const chainTokens = tokens.map((token: Token) => {
        return {
          chainId: chainId,
          decimals: token?.decimals,
          symbol: token?.symbol,
          name: token?.name,
          logo: token?.logoURI,
          address: token?.address,
        };
      });
      formattedCurrencies = [...formattedCurrencies, ...chainTokens];
    });
    return formattedCurrencies;
  });
}

export function useSquidCurrencies() {
  return useQuery(['squidCurrencies'], async () => {
    const squid = new Squid({
      baseUrl: SQUID_API,
    });
    await squid.init();
    const tokens = squid.tokens as TokenData[];
    const formattedTokens: BridgeCurrency[] = tokens.map((token: TokenData) => {
      return {
        chainId: token?.chainId.toString(),
        decimals: token?.decimals,
        symbol: token?.symbol,
        name: token?.name,
        logo: token?.logoURI,
        address: token?.address,
      };
    });
    return formattedTokens;
  });
}

export function useHashportCurrencies() {
  return useQuery(['hashportCurrencies'], async () => {
    const response = await fetch(`${HASHPORT_API}/assets/amounts`);
    const chains = response && response.status === 200 ? await response.json() : [];
    const tokenList: any[] = Object.values(chains);
    const formattedCurrencies: BridgeCurrency[] = [];
    tokenList.map((tokens: any) => {
      Object.values(tokens).forEach((value: any) => {
        const data = {
          chainId: value?.networkId.toString(),
          decimals: value?.decimals,
          symbol: value?.symbol,
          name: value?.name,
          logo: 'https://app.hashport.network/assets/HBAR_DARK.311aac1e.svg',
          address: value?.id,
          ...(value?.bridgeableNetworks && {
            bridgeableNetworks: Object.values(value.bridgeableNetworks).map((val: any) => {
              const asset = val.wrappedAsset;
              const data = {
                chainId: asset.networkId,
                decimals: asset.decimals,
                symbol: asset.symbol,
                name: asset.name,
                logo: 'https://app.hashport.network/assets/HBAR_DARK.311aac1e.svg',
                address: asset.id,
              };
              return data;
            }),
          }),
        };
        formattedCurrencies.push(data);
      });
    });
    const updatedFormattedCurrencies = [...formattedCurrencies];
    // reverse bridgeableNetwork field
    // e.g. if USDC[hts] is bridgeable to USDC, USDC should also be bridgeable to USDC[hts]
    // so we add USDC[hts] to USDC's bridgeableNetworks field (hashport didn't make this field available in destination asset)
    formattedCurrencies.map((currency) => {
      if (currency?.bridgeableNetworks) {
        currency.bridgeableNetworks.map((bridgeableNetwork) => {
          const index = updatedFormattedCurrencies.findIndex(
            (item) => item.address === bridgeableNetwork.address && item.chainId === bridgeableNetwork.chainId,
          );
          if (index !== -1) {
            if (!updatedFormattedCurrencies[index].bridgeableNetworks) {
              updatedFormattedCurrencies[index].bridgeableNetworks = [];
            }
            updatedFormattedCurrencies[index]?.bridgeableNetworks?.push({
              chainId: currency.chainId,
              decimals: currency.decimals,
              symbol: currency.symbol,
              name: currency.name,
              logo: currency.logo,
              address: currency.address,
            });
          }
        });
      }
    });

    return updatedFormattedCurrencies;
  });
}

export function useBridgeCurrencies() {
  const lifiCurrencies = useLiFiSwapCurrencies();
  const squidCurrencies = useSquidCurrencies();
  const hashportCurrencies = useHashportCurrencies();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiCurrencies.status === 'success' ? lifiCurrencies?.data ?? [] : [],
      [SQUID.id]: squidCurrencies.status === 'success' ? squidCurrencies?.data ?? [] : [],
      [HASHPORT.id]: hashportCurrencies.status === 'success' ? hashportCurrencies?.data ?? [] : [],
    };
  }, [lifiCurrencies.status, squidCurrencies.status, hashportCurrencies.status]);
}
