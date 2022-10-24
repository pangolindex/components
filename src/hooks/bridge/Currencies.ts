import LIFI from '@lifi/sdk';
import { Token } from '@lifi/types';
import { BridgeCurrency, LIFI as LIFIBridge, THORSWAP } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { BRIDGE_THORSWAP } from 'src/constants';

export function useThorSwapCurrencies() {
  return useQuery(['thorswapCurrencies'], async () => {
    const response = await fetch(`${BRIDGE_THORSWAP}/universal/currenciesFull`);
    const currencies = response && response.status === 200 ? await response.json() : [];
    const formattedCurrencies: BridgeCurrency[] = currencies.map((currency) => {
      return {
        chainId: currency?.chainId,
        decimals: currency.decimals,
        symbol: currency?.ticker,
        name: currency?.name,
        logo: currency?.image,
        address: currency?.address,
      };
    });
    return formattedCurrencies;
  });
}

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
  const thorswapCurrencies = useThorSwapCurrencies();
  const lifiCurrencies = useLiFiSwapCurrencies();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiCurrencies.status === 'success' ? lifiCurrencies?.data ?? [] : [],
      [THORSWAP.id]: thorswapCurrencies.status === 'success' ? thorswapCurrencies?.data ?? [] : [],
    };
  }, [thorswapCurrencies, lifiCurrencies]);
}

//TODO: remove this when we have a better way to get the chain data
export function useBridgeCurrenciesAlternativeApproach() {
  const query = useQuery(['allCurrencies'], async () => {
    const response = await fetch(`${BRIDGE_THORSWAP}/universal/currenciesFull`);
    const currencies = response && response.status === 200 ? await response.json() : [];
    const formattedCurrenciesThorSwap: BridgeCurrency[] = currencies.map((currency) => {
      return {
        chainId: currency?.chainId,
        decimals: currency.decimals,
        symbol: currency?.ticker,
        name: currency?.name,
        logo: currency?.image,
        address: currency?.address,
      };
    });

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
    return formattedCurrenciesThorSwap.concat(formattedCurrencies);
  });

  return useMemo(() => {
    return {
      ...query,
    };
  }, [query]);
}
