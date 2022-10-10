import { hethers } from '@hashgraph/hethers';

import React from 'react';

export const HederaProvider = (provider) => {
  if (provider) {
    provider.getTransactionReceipt = async (transactionId: string) => {
      try {
        const hethersProvider = hethers.providers.getDefaultProvider('testnet', undefined);

        const replaceText = transactionId.replace('@', '-');

        const lastIndex = replaceText.lastIndexOf('.');

        let before = '';
        let after = '';

        if (lastIndex !== -1) {
          before = replaceText.slice(0, lastIndex);
          after = replaceText.slice(lastIndex + 1);
        }

        const newTransactionId = before + '-' + after;

        //Transaction id. Please use "shard.realm.num-sss-nnn" format where sss are seconds and nnn are nanoseconds
        const receipt = await hethersProvider.getTransaction(newTransactionId);

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
      return 0;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    provider.execute = async (_method, _params) => {
      //  implement it
    };
  }
  return provider;
};
