import { CAVAX, ChainId, Currency, Token, WAVAX } from '@pangolindex/sdk';
import { NativeCurrency as UniCurrency, Token as UniToken } from '@uniswap/sdk-core';

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === CAVAX[chainId] ? WAVAX[chainId] : currency instanceof Token ? currency : undefined;
}

function convertToPangolinToken(token: UniToken): Token {
  return new Token(token.chainId, token.address, token.decimals, token?.symbol, token?.name);
}

export function wrappedGelatoCurrency(
  currency: UniCurrency | UniToken,
  chainId: ChainId | undefined,
): Token | undefined {
  return chainId && !currency?.isToken
    ? WAVAX[chainId]
    : currency.isToken
    ? convertToPangolinToken(currency)
    : undefined;
}
