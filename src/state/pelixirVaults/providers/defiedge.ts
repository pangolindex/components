// import { getStrategyMetaData } from '@defiedge/sdk';
// import { SupportedChainId } from '@defiedge/sdk/dist/src/types';
// import { Strategy } from '@defiedge/sdk/dist/src/types/strategyMetaQuery';
import { ChainId, DEFIEDGE, Token } from '@pangolindex/sdk';
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
    const data: ElixirVault[] = response.data
      .filter((x) => x.network === 'polygon') //TODO: Remove this filter
      .map((strategy: DefiEdgeAllStrategyData) => {
        return {
          strategyProvider: [DEFIEDGE],
          selected: false,
          address: strategy.address,
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
