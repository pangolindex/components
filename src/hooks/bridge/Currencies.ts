import { Squid, TokenData } from '@0xsquid/sdk';
import LIFI from '@lifi/sdk';
import { Token } from '@lifi/types';
import { BridgeCurrency, LIFI as LIFIBridge, RANGO, SQUID } from '@pangolindex/sdk';
import { TransactionType as RangoChainType, RangoClient, Token as RangoToken } from 'rango-sdk-basic';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { RANGO_API_KEY, SQUID_API, ZERO_ADDRESS } from 'src/constants';

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

export function useRangoCurrencies() {
  return useQuery(['rangoCurrencies'], async () => {
    const rango = new RangoClient(RANGO_API_KEY);
    const meta = await rango.meta();
    const evmChains = meta?.blockchains.filter((chain) => chain.type === RangoChainType.EVM);
    const evmChainsNames = evmChains.map((chain) => chain.name);
    const evmChainNameToId = evmChains.map((chain) => ({
      [chain.name]: chain.chainId,
    }));
    const formattedTokens: BridgeCurrency[] = meta?.tokens
      .filter((token: RangoToken) => evmChainsNames?.includes(token.blockchain))
      .map((token: RangoToken) => {
        return {
          chainId: evmChainNameToId[token?.blockchain],
          decimals: token?.decimals,
          symbol: token?.symbol,
          name: token?.name,
          logo: token?.image,
          address: token?.address || ZERO_ADDRESS,
        };
      });
    return formattedTokens;
  });
}

export function useBridgeCurrencies() {
  const lifiCurrencies = useLiFiSwapCurrencies();
  const squidCurrencies = useSquidCurrencies();
  const rangoCurrencies = useRangoCurrencies();
  return useMemo(() => {
    return {
      [LIFIBridge.id]: lifiCurrencies.status === 'success' ? lifiCurrencies?.data ?? [] : [],
      [SQUID.id]: squidCurrencies.status === 'success' ? squidCurrencies?.data ?? [] : [],
      [RANGO.id]: rangoCurrencies.status === 'success' ? rangoCurrencies?.data ?? [] : [],
    };
  }, [lifiCurrencies.status, squidCurrencies.status, rangoCurrencies.status]);
}
