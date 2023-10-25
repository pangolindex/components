import { depositLP, getLiquidityRatio, getUserDeshareBalance, removeLP } from '@defiedge/sdk';
import { DEFIEDGE, Token } from '@pangolindex/sdk';
import axios from 'axios';
import {
  DefiEdgeAllStrategyData,
  DefiEdgeStrategyData,
  DefiEdgeStrategyLiquidityData,
  DepositElixirVaultLiquidityProps,
  ElixirVault,
  ElixirVaultDetail,
  GetElixirVaultDetailsProps,
  GetElixirVaultsProps,
  RemoveElixirVaultLiquidityProps,
  TransactionStatus,
} from '../types';

export const getDefiEdgeVaults: any = async ({ chain }: GetElixirVaultsProps) => {
  try {
    const url = `https://api.defiedge.io/strategies?dex=Pangolin&network=${chain?.name?.toLocaleLowerCase()}`;
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

export const getDefiEdgeVaultDetails: any = async ({ chain, vault, account, library }: GetElixirVaultDetailsProps) => {
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

  let liqData;
  try {
    const liqResponse = await axios.get(strategyLiquidityDetailUrl, reqHeader);
    liqData = liqResponse.data as DefiEdgeStrategyLiquidityData;
  } catch (err) {
    console.log(err);
  }

  let ratio: number | undefined;
  if (library) {
    try {
      ratio = await getLiquidityRatio(vault.address, library);
    } catch (err) {
      console.log(err);
    }
  }
  let userLiquidity: string | undefined;
  if (account && library) {
    try {
      userLiquidity = await getUserDeshareBalance(account, vault.address, library);
    } catch (err) {
      console.log(err);
    }
  }
  const res: ElixirVaultDetail = {
    ...vault,
    underlyingToken0: liqData?.amount0Total,
    underlyingToken1: liqData?.amount1Total,
    underlyingToken0Price: data?.token0Price,
    underlyingToken1Price: data?.token1Price,
    strategyDetailWebsite,
    ...(userLiquidity ? { userLiquidity } : {}),
    ...(ratio ? { ratio } : {}),
  };
  return res;
};

export const depositDefiEdgeLiquidity: any = async ({
  selectedElixirVault,
  amount0,
  amount1,
  account,
  library,
  changeDepositTransactionLoaderStatus,
  setDepositTransactionError,
}: DepositElixirVaultLiquidityProps) => {
  try {
    const res = await depositLP(
      account,
      amount0, // can be 0 when only depositing amount1 or verse
      amount1,
      selectedElixirVault.address,
      library,
    );
    changeDepositTransactionLoaderStatus &&
      changeDepositTransactionLoaderStatus({
        depositTransactionLoaderStatus: false,
        depositTransactionStatus: TransactionStatus.SUCCESS,
      });
    return res;
  } catch (err: any) {
    setDepositTransactionError && setDepositTransactionError(err);
    changeDepositTransactionLoaderStatus &&
      changeDepositTransactionLoaderStatus({
        depositTransactionLoaderStatus: false,
        depositTransactionStatus: TransactionStatus.FAILED,
      });
    throw err;
  }
};

export const removeDefiEdgeVaultLiquidity: any = async ({
  vault,
  shares,
  account,
  library,
  changeRemoveTransactionLoaderStatus,
  setRemoveTransactionError,
}: RemoveElixirVaultLiquidityProps) => {
  try {
    const txnDetails = await removeLP(account, shares, vault?.address, library);
    changeRemoveTransactionLoaderStatus &&
      changeRemoveTransactionLoaderStatus({
        removeTransactionLoaderStatus: false,
        removeTransactionStatus: TransactionStatus.SUCCESS,
      });
    return txnDetails;
  } catch (err) {
    setRemoveTransactionError && setRemoveTransactionError(err);
    changeRemoveTransactionLoaderStatus &&
      changeRemoveTransactionLoaderStatus({
        removeTransactionLoaderStatus: false,
        removeTransactionStatus: TransactionStatus.FAILED,
      });
    throw err;
  }
};
