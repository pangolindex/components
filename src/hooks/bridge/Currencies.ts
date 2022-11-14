import LIFI from '@lifi/sdk';
import { Token } from '@lifi/types';
import { BridgeCurrency, LIFI as LIFIBridge } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

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

export function useBridgeCurrencies() {
  const lifiCurrencies = useLiFiSwapCurrencies();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiCurrencies.status === 'success' ? lifiCurrencies?.data ?? [] : [],
    };
  }, [lifiCurrencies.status]);
}
