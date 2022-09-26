import { hethers } from '@hashgraph/hethers';
import { HEDERA_API_BASE_URL } from 'src/constants';

export interface HederaTokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

class Hedera {
  //Todo : Make a constructor  to call direct axios common call with base url
  public async getMetadata(address: string): Promise<HederaTokenMetadata | undefined> {
    try {
      const tokenId = hethers.utils.asAccountString(address);

      return fetch(HEDERA_API_BASE_URL + '/api/v1/tokens/' + tokenId, {
        method: 'GET',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      })
        .then((res) => res.json())
        .then((tokenInfo) => {
          const token = {
            id: address,
            name: tokenInfo?.name,
            symbol: tokenInfo?.symbol,
            decimals: Number(tokenInfo?.decimals),
            icon: '',
          };
          return token;
        });
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  public async getTokenBalance(address: string, account?: string) {
    try {
      const tokenId = hethers.utils.asAccountString(address);
      const accountId = account ? hethers.utils.asAccountString(account) : '';

      return fetch(HEDERA_API_BASE_URL + `/api/v1/tokens/${tokenId}/balances?account.id=${accountId}`, {
        method: 'GET',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      })
        .then((res) => res.json())
        .then((balance) => {
          const tokenBalance = balance?.balances?.[0]?.balance;
          return tokenBalance;
        });
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}

export const hederaFn = new Hedera();
