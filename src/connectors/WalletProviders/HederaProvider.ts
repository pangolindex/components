import React from 'react';
import { hethers } from '@hashgraph/hethers';

export const HederaProvider = (provider) => {
  if (provider) {
    provider.getTransactionReceipt = async (transactionId: string) => {
      try {
        const hethersProvider = hethers.providers.getDefaultProvider('testnet', undefined);

        const receipt = await hethersProvider.getTransaction(transactionId);

        if (!receipt?.hash) {
          return undefined;
        }

        return {
          blockHash: '',
          blockNumber: '',
          contractAddress: '',
          from: receipt?.from,
          status: receipt?.customData?.result === 'SUCCESS' ? 1 : 0,
          to: receipt?.to,
          hash: receipt?.hash,
          transactionHash: receipt?.hash,
          transactionIndex: 1,
        };
      } catch (error) {
        return {
          blockHash: '',
          blockNumber: '',
          contractAddress: '',
          from: '',
          status: 0,
          to: '',
          hash: '',
          transactionHash: '',
          transactionIndex: 0,
        };
      }
    };

    provider.getBlockNumber = async () => {
      return '';
    };

    provider.execute = async (method, params) => {
      // const res = await (provider as any).send(method, params);
      // return res?.result;
    };
  }
  return provider;
};
