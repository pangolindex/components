import { Token } from '@pangolindex/sdk';
import { SerializedToken } from '@honeycomb/state-hooks';

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
}
