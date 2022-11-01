import { Token, TokenAmount } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useTokenContract } from '../hooks/useContract';
import { useSingleCallResult } from '../state/pmulticall/hooks';

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false);

  console.log('===owner', owner);
  console.log('===spender', spender);

  console.log('===contract', contract);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);
  console.log('===inputs', inputs);
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result;

  console.log('===token', token);
  console.log('===allowance111', allowance);

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined),
    [token, allowance],
  );
}
