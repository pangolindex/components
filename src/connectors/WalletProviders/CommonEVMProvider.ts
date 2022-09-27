import React from 'react';

export const CommonEVMProvider = (provider) => {
  if (provider) {
    provider.getTransactionReceipt = async (hash: string) => {
      const receipt = await (provider as any).request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
      });

      if (!receipt.blockNumber || !receipt.blockHash) {
        return undefined;
      }

      receipt.blockNumber = Number(receipt.blockNumber);
      receipt.transactionIndex = Number(receipt.transactionIndex);
      receipt.hash = receipt.transactionHash;
      receipt.status = Number(receipt.status);

      return receipt;
    };

    provider.getBlockNumber = async () => {
      const block = await (provider as any).request({
        method: 'eth_blockNumber',
        params: [],
      });
      return Number(block);
    };

    provider.execute = async (method, params) => {
      const res = await (provider as any).request({ method: method, params: params });
      return res;
    };

    provider.getBlockTimestamp = async (blockNumber) => {
      const result: { timestamp: string } | null = await (provider as any).request({
        method: 'eth_getBlockByNumber',
        params: [`0x${blockNumber.toString(16)}`, false],
      });

      if (!result) {
        return 0;
      }
      return parseInt(result?.timestamp, 16).toString() ?? 0;
    };
  }
  return provider;
};
