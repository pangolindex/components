import React from 'react';
import { Client, TransactionRecordQuery } from '@hashgraph/sdk';
import { toHexString } from 'src/utils/toHexString';

export const HederaProvider = (provider) => {
  if (provider) {
    provider.getTransactionReceipt = async (hash: string) => {
      console.log('hash=====', hash);
      try {
        const transactionId = hash;
        const operatorAccount = '0.0.47977330';
        const operatorPrivateKey =
          '302e020100300506032b6570042204208b97c5c963a2ffa06ca9c3a5837eaebc9d21fd92c42a8b79baa2c13af306fa53';

        const client = Client.forTestnet();

        client.setOperator(operatorAccount, operatorPrivateKey);

        console.log('client=====', client);

        const txQuery = new TransactionRecordQuery().setTransactionId(transactionId);

        console.log('txQuery=====', txQuery);

        const txResponse = await txQuery.execute(client);

        console.log('txResponse=====', txResponse);
        console.log('transactionHash=====',  JSON.stringify(txResponse));
      } catch (error) {
        console.log('err====', error);
      }

      //Get the receipt of the transaction
      // const receipt = await txResponse.getReceipt(client);
      // const receipt = await (provider as any).request({
      //   method: 'eth_getTransactionReceipt',
      //   params: [hash],
      // });

      // if (!receipt.blockNumber || !receipt.blockHash) {
      //   return undefined;
      // }

      // receipt.blockNumber = Number(receipt.blockNumber);
      // receipt.transactionIndex = Number(receipt.transactionIndex);
      // receipt.hash = receipt.transactionHash;
      // receipt.status = Number(receipt.status);

      // return receipt;
    };

    provider.getBlockNumber = async () => {
      return 456465465465;
    };

    provider.execute = async (method, params) => {
      // const res = await (provider as any).send(method, params);
      // return res?.result;
    };
  }
  return provider;
};
