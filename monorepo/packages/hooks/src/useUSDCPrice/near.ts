import { parseUnits } from '@ethersproject/units';
import { NEAR_API_BASE_URL, USDCe } from '@pangolindex/constants';
import { Currency, Price, TokenAmount } from '@pangolindex/sdk';
import { wrappedCurrency } from '@pangolindex/utils';
import { useEffect, useMemo, useState } from 'react';
import { useChainId } from '../index';

export function useNearUSDCPrice(currency?: Currency): Price | undefined {
  const [result, setResult] = useState<string>('');

  const chainId = useChainId();
  const token = wrappedCurrency(currency, chainId);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const url = `${NEAR_API_BASE_URL}/list-token-price`;
        const response = await fetch(url);
        const data = await response.json();

        if (token) {
          setResult(data?.[token?.address]?.price);
        }
      } catch (error) {
        console.error('near token api error', error);
      }
    };
    fetchPrice();
  }, [token]);

  const USDC = USDCe[chainId];

  return useMemo(() => {
    if (!currency || !token || !chainId || !result) {
      return undefined;
    }

    const tokenAmount1 = new TokenAmount(token, parseUnits(result || '1', token?.decimals).toString());
    const tokenAmount2 = new TokenAmount(USDC, parseUnits('1', USDC?.decimals).toString());

    return new Price(USDC, currency, tokenAmount2.raw, tokenAmount1.raw);
  }, [chainId, currency, token, USDC, result]);
}
