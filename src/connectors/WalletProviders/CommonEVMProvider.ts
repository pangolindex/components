import { Web3Provider } from '@ethersproject/providers';
import React from 'react';

export const CommonEVMProvider = (provider: Web3Provider) => {
  if (provider) {
    const getTransactionReceipt = async (hash: string) => {
      if (provider.send) {
        const receipt = await provider.send('eth_getTransactionReceipt', [hash]);

        if (!receipt?.blockNumber || !receipt?.blockHash) {
          return undefined;
        }

        receipt.blockNumber = Number(receipt?.blockNumber);
        receipt.transactionIndex = Number(receipt?.transactionIndex);
        receipt.hash = receipt?.transactionHash;
        receipt.status = Number(receipt?.status);

        return receipt;
      }
      return undefined;
    };

    const getBlockNumber = async () => {
      if (provider.getBlockNumber) {
        try {
          const block = await provider.getBlockNumber();
          return Number(block);
        } catch (error) {
          return undefined;
        }
      }

      return 0;
    };

    const execute = async (method: string, params: any[]) => {
      const res = await provider.send(method, params);
      return res;
    };

    const getBlockTimestamp = async (blockNumber: number) => {
      if (provider.send) {
        const result: { timestamp: string } | null = await provider.send('eth_getBlockByNumber', [
          `0x${blockNumber.toString(16)}`,
          false,
        ]);
        if (!result) {
          return 0;
        }
        return parseInt(result?.timestamp, 16).toString() ?? 0;
      }
      return 0;
    };

    return {
      getTransactionReceipt,
      getBlockNumber,
      getBlockTimestamp,
      execute,
    };
  }
  return provider;
};
