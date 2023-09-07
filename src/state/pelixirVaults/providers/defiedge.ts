import { CHAINS, ChainId, DEFIEDGE, Token } from '@pangolindex/sdk';
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
    console.log('response: ', response);
    const currency0 = new Token(ChainId.AVALANCHE, '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15', 18, 'ETH', 'Ether');
    const currency1 = new Token(
      ChainId.AVALANCHE,
      CHAINS[ChainId.AVALANCHE].contracts!.png,
      18,
      CHAINS[ChainId.AVALANCHE].png_symbol!,
      'Pangolin',
    );
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
