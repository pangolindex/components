import { Token, TokenAmount } from '@pangolindex/sdk';
import { useTokenContract } from '@pangolindex/shared';
import { useSingleCallResult } from '@pangolindex/state';
import { useMemo } from 'react';

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);

  const allowance = useSingleCallResult(contract, 'allowance', inputs).result;

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined),
    [token, allowance],
  );
}
