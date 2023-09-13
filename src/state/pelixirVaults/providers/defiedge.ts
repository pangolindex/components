import { ChainId, DEFIEDGE, Token } from '@pangolindex/sdk';
import axios from 'axios';
import { DefiEdgeAllStrategyData, ElixirVault, GetElixirVaultsProps } from '../types';

export const getDefiEdgeVaults: any = async ({ chain }: GetElixirVaultsProps) => {
  try {
    const url = 'https://api.defiedge.io/graphql';
    const query = `{
      "query": "query Strategies($where: StrategyWhereInput!) { strategies(where: $where) { id title subTitle description updatedAt network sharePrice address aum createdAt since_inception { USD BTC MATIC ETH } } }",
      "variables": {
        "where": {
          "dex": {
            "equals": "Uniswap"
          },
          "network": {
            "equals": "${chain?.name?.toLocaleLowerCase()}"
          }
        }
      }
    }`;
    const response = await axios.post(url, query, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // ------------------->
    // ------DUMMY DATA--->
    // ------------------->
    const currency0 = new Token(
      ChainId.POLYGON,
      '0x0000000000000000000000000000000000001010',
      18,
      'MATIC',
      'Matic Token',
    );
    const currency1 = new Token(ChainId.POLYGON, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 18, 'USDC', 'USD Coin');
    // ------------------->
    // ------------------->
    const data: ElixirVault[] = response.data.data.strategies.map((strategy: DefiEdgeAllStrategyData) => {
      return {
        strategyProvider: [DEFIEDGE],
        selected: false,
        id: strategy.id,
        poolTokens: [currency0, currency1],
        sharePrice: strategy.sharePrice.toString(),
        incentivized: false,
        feesApr: '0',
        incentivizationApr: '0',
      };
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
