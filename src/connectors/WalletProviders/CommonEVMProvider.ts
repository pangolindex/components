import { Web3Provider } from '@ethersproject/providers';
import { ChainId } from '@pangolindex/sdk';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CommonEVMProvider = (provider: Web3Provider, _chainId: ChainId) => {
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

    return {
      getTransactionReceipt,
      getBlockNumber,
      execute,
    };
  }
  return provider;
};
