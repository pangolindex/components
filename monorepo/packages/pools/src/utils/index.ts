import { Token } from '@pangolindex/sdk';
import { SerializedToken } from '@pangolindex/state-hooks';

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
}
