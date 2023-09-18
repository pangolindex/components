import { DEFIEDGE, Token } from '@pangolindex/sdk';
import axios from 'axios';
import {
  DefiEdgeAllStrategyData,
  DefiEdgeStrategyData,
  DefiEdgeStrategyLiquidityData,
  ElixirVault,
  ElixirVaultDetail,
  GetElixirVaultsProps,
} from '../types';

export const getDefiEdgeVaults: any = async ({ chain }: GetElixirVaultsProps) => {
  try {
    const url = `https://api.defiedge.io/strategies?dex=Uniswap&network=${chain?.name?.toLocaleLowerCase()}`;
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data: ElixirVault[] = response.data.map((strategy: DefiEdgeAllStrategyData) => {
      return {
        strategyProvider: [DEFIEDGE],
        selected: false,
        address: strategy.address,
        poolTokens: [strategy.token0 as unknown as Token, strategy.token1 as unknown as Token],
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

export const getDefiEdgeVaultDetails: any = async ({ chain, vaultAddress }) => {
  const strategyDetailUrl = `https://api.defiedge.io/${chain?.name?.toLocaleLowerCase()}/details?strategies=${vaultAddress}`;
  const strategyLiquidityDetailUrl = `https://api.defiedge.io/${chain?.name?.toLocaleLowerCase()}/${vaultAddress}/liquidity`;
  const strategyDetailWebsite = `https://app.defiedge.io/s/${chain?.name?.toLocaleLowerCase()}/${vaultAddress}`;
  const reqHeader = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const detailResponse = await axios.get(strategyDetailUrl, reqHeader);
  const data = detailResponse.data?.[0] as DefiEdgeStrategyData;

  const liqResponse = await axios.get(strategyLiquidityDetailUrl, reqHeader);
  const liqData = liqResponse.data as DefiEdgeStrategyLiquidityData;

  const res: ElixirVaultDetail = {
    underlyingToken0: liqData.amount0Total,
    underlyingToken1: liqData.amount1Total,
    underlyingToken0Price: data.token0Price,
    underlyingToken1Price: data.token1Price,
    strategyDetailWebsite,
  };
  return res;
};
