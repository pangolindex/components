import React from 'react';

export const CommonEVMProvider = (provider) => {
  if (provider) {
    provider.getTransactionReceipt = async (hash: string) => {
      const receipt = await (provider as any).request({
        method: 'eth_getTransactionByHash',
        params: [hash],
      });

      if (!receipt.blockNumber || !receipt.blockHash) {
        return undefined;
      }

      receipt.blockNumber = Number(receipt.blockNumber);
      receipt.transactionIndex = Number(receipt.transactionIndex);
      return receipt;
    };

    provider.getBlockNumber = async () => {
      const block = await (provider as any).request({
        method: 'eth_blockNumber',
        params: [],
      });
      return Number(block);
    };

    provider.execute = (method, params) => {
      return (provider as any).send(method, params);
    };
  }
  return provider;
};
