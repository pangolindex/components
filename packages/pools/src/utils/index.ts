import { SerializedToken } from '@honeycomb-finance/state-hooks';
import { Token } from '@pangolindex/sdk';

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
}
