export type WarpTokenConfig = {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  type: string;
  hypNativeAddress: string;
};

export const tokenList: WarpTokenConfig[] = [
  {
    chainId: 43113,
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
    type: 'native',
    hypNativeAddress: '0xF97EC069476f843Ac199A015B7Ab1087c24F32E4',
  },
];
