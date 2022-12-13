import { TokenData } from '@0xsquid/sdk';
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
    const response = await fetch(`${SQUID_API}/tokens`);
    const tokens = response && response.status === 200 ? ((await response.json())?.tokens as TokenData[]) : [];
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
    const formattedCurrencies: any = [];
    tokenList.map((tokens: any) => {
      Object.entries(tokens).forEach(([key, value]: any) => {
        console.log(key);
        const data = {
          chainId: value?.networkId.toString(),
          decimals: value?.decimals,
          symbol: value?.symbol,
          name: value?.name,
          logo: 'https://app.hashport.network/assets/HBAR_DARK.311aac1e.svg',
          address: value?.id,
        };
        formattedCurrencies.push(data);
      });
    });
    return formattedCurrencies;
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
