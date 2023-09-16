import { hederaFn } from 'src/HashConnector/hedera';

export const HederaProvider = (provider: any) => {
  if (provider) {
    const getTransactionReceipt = async (transactionId: string) => {
      try {
        //getting this string as transactionId     "0.0.29562194@1645089473.013219243"
        //we need to convert into                  "0.0.29562194-1645089473-013219243"
        const replaceText = transactionId.replace('@', '-');

        const lastIndex = replaceText.lastIndexOf('.');

        let before = '';
        let after = '';

        if (lastIndex !== -1) {
          before = replaceText.slice(0, lastIndex);
          after = replaceText.slice(lastIndex + 1);
        }

        const newTransactionId = before + '-' + after;

        const transaction = await hederaFn.getTransactionById(newTransactionId);

        if (!transaction) {
          return undefined;
        }

        const block = await hederaFn.getTransactionBlock(transaction?.consensusTimestamp);

        return {
          blockHash: block?.hash,
          blockNumber: block?.number,
          contractAddress: '',
          from: transaction?.from,
          status: transaction?.status,
          to: '',
          hash: transaction?.transactionHash,
          transactionHash: transaction?.transactionHash,
          transactionIndex: 1,
        };
      } catch (error) {
        console.log('receipt error', error);
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

    const getBlockNumber = async () => {
      const blockNumber = await hederaFn.getTransactionLatestBlock();

      return blockNumber ? blockNumber : 0;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const execute = async (_method, _params) => {
      //  implement it
    };

    return {
      getTransactionReceipt,
      getBlockNumber,
      execute,
    };
  }
  return provider;
};
