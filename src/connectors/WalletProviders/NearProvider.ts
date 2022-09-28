import React from 'react';
import { near } from '..';

export const NearProvider = (provider) => {
  if (provider) {
    provider.getTransactionReceipt = async (hash: string) => {
      try {
        const accountId = near?.wallet?.account?.()?.accountId;
        const res = await provider?.txStatus(hash, accountId);

        const isSuccess = res?.receipts_outcome?.every((item) => !item?.outcome?.status?.Failure);
        const blockHash = res?.transaction_outcome?.block_hash;

        let blockNumber = 0;
        try {
          const block = await provider.block({ blockId: blockHash });
          blockNumber = block?.header?.height;
        } catch (error) {
          console.log(error);
        }

        return {
          blockHash: blockHash,
          blockNumber,
          contractAddress: '',
          from: res?.transaction?.signer_id,
          status: isSuccess ? 1 : 0,
          to: res?.transaction?.receiver_id,
          hash,
          transactionHash: hash,
          transactionIndex: res?.transaction?.nonce,
        };
      } catch (error) {
        console.log(error);
      }
    };

    provider.getBlockNumber = async () => {
      const block = await provider.block({ finality: 'optimistic' });
      return block?.header?.height;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    provider.execute = async (_method, _params) => {
      //  implement it
    };

    provider.getBlockTimestamp = async (blockNumber: number) => {
      const block = await provider.block(blockNumber);
      return block?.header?.timestamp?.toString() ?? '0';
    };
  }
  return provider;
};
