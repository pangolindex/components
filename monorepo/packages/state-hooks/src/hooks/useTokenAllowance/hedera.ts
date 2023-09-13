import { hederaFn } from '@honeycomb-finance/wallet-connectors';
import { Token, TokenAmount } from '@pangolindex/sdk';
import { useQuery } from 'react-query';
import { useIsApprovingInfinite } from 'src/state';

interface HederaAllowanceInfo {
  owner: string;
  spender: string;
  timestamp: {
    from: string | null;
    to: string | null;
  };
  amount_granted: number;
  token_id: string;
}

export function useHederaTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const isApprovingInfinite = useIsApprovingInfinite();
  const { data } = useQuery(
    ['get-hedera-token-allowance', token?.address, owner, spender],
    async () => {
      if (!token || !owner || !spender) return undefined;
      const tokenId = hederaFn.hederaId(token.address);
      const ownerId = hederaFn.hederaId(owner);
      const spenderId = hederaFn.hederaId(spender);

      const response = await hederaFn.call<{ allowances: HederaAllowanceInfo[]; links: { next: string | null } }>({
        url: `/api/v1/accounts/${ownerId}/allowances/tokens?spender.id=${spenderId}&token.id=${tokenId}`,
        method: 'GET',
      });

      const allowances = response.allowances;

      return new TokenAmount(token, allowances?.[0]?.amount_granted ?? 0);
    },
    {
      refetchInterval: isApprovingInfinite ? false : 1000 * 60 * 2,
    },
  );

  return data;
}
