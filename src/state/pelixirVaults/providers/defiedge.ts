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
      const { token0, token1 } = strategy;
      const tokenA =
        token0 && chain.chain_id && new Token(chain.chain_id, token0.id, token0.decimals, token0.symbol, token0.name);
      const tokenB =
        token1 && chain.chain_id && new Token(chain.chain_id, token1.id, token1.decimals, token1.symbol, token1.name);

      return {
        strategyProvider: [DEFIEDGE],
        selected: false,
        address: strategy.address,
        poolTokens: [tokenA, tokenB],
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

export const getDefiEdgeVaultDetails: any = async ({ chain, vault }) => {
  const strategyDetailUrl = `https://api.defiedge.io/${chain?.name?.toLocaleLowerCase()}/details?strategies=${
    vault?.address
  }`;
  const strategyLiquidityDetailUrl = `https://api.defiedge.io/${chain?.name?.toLocaleLowerCase()}/${
    vault?.address
  }/liquidity`;
  const strategyDetailWebsite = `https://app.defiedge.io/s/${chain?.name?.toLocaleLowerCase()}/${vault?.address}`;
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
    ...vault,
    underlyingToken0: liqData.amount0Total,
    underlyingToken1: liqData.amount1Total,
    underlyingToken0Price: data.token0Price,
    underlyingToken1Price: data.token1Price,
    strategyDetailWebsite,
  };
  return res;
};
