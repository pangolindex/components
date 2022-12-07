import { TokenData } from '@0xsquid/sdk';
import LIFI from '@lifi/sdk';
import { Token } from '@lifi/types';
import { BridgeCurrency, LIFI as LIFIBridge, SQUID } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { SQUID_API } from 'src/constants';

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

export function useBridgeCurrencies() {
  const lifiCurrencies = useLiFiSwapCurrencies();
  const squidCurrencies = useSquidCurrencies();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiCurrencies.status === 'success' ? lifiCurrencies?.data ?? [] : [],
      [SQUID.id]: squidCurrencies.status === 'success' ? squidCurrencies?.data ?? [] : [],
    };
  }, [lifiCurrencies.status, squidCurrencies.status]);
}
