import { ChainId, Token, WAVAX } from '@pangolindex/sdk';
import { NativeCurrency as UniCurrency, Token as UniToken } from '@uniswap/sdk-core';

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
