import { Squid, TokenData } from '@0xsquid/sdk';
import LIFI from '@lifi/sdk';
import { Token } from '@lifi/types';
import { BridgeCurrency, LIFI as LIFIBridge, RANGO, SQUID } from '@pangolindex/sdk';
import { BlockchainMeta, TransactionType as RangoChainType, RangoClient, Token as RangoToken } from 'rango-sdk-basic';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { RANGO_API_KEY, SQUID_API, ZERO_ADDRESS } from 'src/constants';

export function useLiFiSwapCurrencies() {
  return useQuery(['lifiCurrencies'], async () => {
    const lifi = new LIFI();
    const data = await lifi.getTokens();
    let formattedCurrencies: BridgeCurrency[] = [];

    Object.entries(data?.tokens).forEach(([chainId, tokens]) => {
      const chainTokens: BridgeCurrency[] = tokens.map((token: Token) => {
        return new BridgeCurrency(token?.address, chainId, token?.decimals, token?.logoURI, token?.symbol, token?.name);
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
    const formattedTokens: (BridgeCurrency | undefined)[] = tokens.map((token: TokenData) => {
      return new BridgeCurrency(
        token?.address,
        token?.chainId?.toString(),
        token?.decimals,
        token?.logoURI,
        token?.symbol,
        token?.name,
      );
    });
    return formattedTokens.filter((chain) => chain !== undefined) as BridgeCurrency[];
  });
}

export function useRangoCurrencies() {
  return useQuery(['rangoCurrencies'], async () => {
    const rango = new RangoClient(RANGO_API_KEY);
    const meta = await rango.meta();

    if (!meta || !meta.tokens) {
      return [];
    }

    const evmChains: BlockchainMeta[] = meta?.blockchains.filter((chain) => chain.type === RangoChainType.EVM);
    const evmChainsNames = evmChains.map((chain) => chain.name);

    const evmChainNameToId = Object.fromEntries(evmChains.map((chain) => [chain.name, chain.chainId]));
    const formattedTokens: BridgeCurrency[] = meta?.tokens
      .filter((token: RangoToken) => evmChainsNames?.includes(token.blockchain))
      .map((token: RangoToken) => {
        return new BridgeCurrency(
          token?.address || ZERO_ADDRESS,
          evmChainNameToId[token.blockchain] || token.blockchain,
          token?.decimals,
          token?.image,
          token?.symbol,
          token?.name,
        );
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
