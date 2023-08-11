import { Token, TokenAmount } from '@pangolindex/sdk';
import { useHederaTokensMetaData } from 'src/state/pwallet/hooks/hedera';

// returns undefined if input token is undefined, ,
// Hedera token total supply
export function useHederaTotalSupply(token?: Token): TokenAmount | undefined {
  const tokensMetadata = useHederaTokensMetaData([token?.address]);

  const totalSupply = token?.address ? tokensMetadata[token?.address]?.totalSupply : '0';

  return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined;
}
