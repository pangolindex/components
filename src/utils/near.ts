import BN from 'bn.js';
import { baseDecode } from 'borsh';
import { Contract, providers, transactions, utils } from 'near-api-js';
import { NEAR_EXCHANGE_CONTRACT_ADDRESS, near } from 'src/connectors';

export interface ViewFunctionOptions {
  methodName: string;
  args?: object;
}

export interface FunctionCallOptions extends ViewFunctionOptions {
  gas?: string;
  amount?: string | null;
}

export interface Transaction {
  receiverId: string;
  functionCalls: FunctionCallOptions[];
}

class Near {
  public async viewFunction(
    tokenId: string,
    {
      methodName,
      args,
    }: {
      methodName: string;
      args?: object;
    },
  ) {
    return near.wallet.account().viewFunction(tokenId, methodName, args);
  }

  getAccountId = () => {
    return near?.wallet?.account?.()?.accountId;
  };

  getTransaction = async (hash: string): Promise<providers.FinalExecutionOutcome | undefined> => {
    try {
      const accountId = near?.wallet?.account?.()?.accountId;
      const provider = await near.getProvider();
      return provider?.txStatus(hash, accountId);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  getTranctionSummary = (tx: providers.FinalExecutionOutcome) => {
    let summary = '';

    const methodName = tx.transaction?.actions?.[0]?.FunctionCall?.method_name;
    if (methodName === 'ft_transfer_call') {
      summary = 'Swap successful';
    }

    return summary;
  };

  public async getMetadata(tokenAddress: string) {
    try {
      const metadata = await this.viewFunction(tokenAddress, {
        methodName: 'ft_metadata',
      });

      return {
        tokenAddress,
        ...metadata,
      };
    } catch (err) {
      return {
        tokenAddress,
        name: tokenAddress,
        symbol: tokenAddress?.split('.')[0].slice(0, 8),
        decimals: 6,
        icon: '',
      };
    }
  }

  public async getTokenBalance(tokenAddress: string, account?: string) {
    return this.viewFunction(tokenAddress, {
      methodName: 'ft_balance_of',
      args: {
        account_id: account,
      },
    });
  }

  public async getTotalSupply(tokenAddress: string) {
    return this.viewFunction(tokenAddress, {
      methodName: 'ft_total_supply',
      args: {},
    });
  }

  public async getExchangeContract(deployer, exchange) {
    const contract = new Contract(deployer, exchange, {
      viewMethods: ['get_pools', 'get_number_of_pools'],
      changeMethods: [],
    });
    return contract as any;
  }

  public async getAllPools(chainId: number) {
    const deployer = await near.wallet.account();
    const contract = await this.getExchangeContract(deployer, NEAR_EXCHANGE_CONTRACT_ADDRESS[chainId]);
    const numberOfPools = await contract.get_number_of_pools();
    return contract.get_pools({
      from_index: 0,
      limit: numberOfPools,
    });
  }

  public getStorageBalance(
    tokenId: string,
    account: string,
  ): Promise<{
    total: string;
    available: string;
  } | null> {
    return this.viewFunction(tokenId, {
      methodName: 'storage_balance_of',
      args: { account_id: account },
    });
  }

  public async createNearTransaction({
    receiverId,
    actions,
    nonceOffset = 1,
  }: {
    receiverId: string;
    actions: transactions.Action[];
    nonceOffset?: number;
  }) {
    const accountId = await near.wallet.getAccountId();
    const walletAccount = await near.wallet.account();

    const localKey = await walletAccount.connection.signer.getPublicKey(accountId, near.wallet._networkId);
    const accessKey = await walletAccount.accessKeyForTransaction(receiverId, actions, localKey);
    if (!accessKey) {
      throw new Error(`Cannot find matching key for transaction sent to ${receiverId}`);
    }

    const block = await walletAccount.connection.provider.block({ finality: 'final' });
    const blockHash = baseDecode(block.header.hash);

    const publicKey = utils.PublicKey.from(accessKey.public_key);
    const nonce = accessKey.access_key.nonce + nonceOffset;

    return transactions.createTransaction(accountId, publicKey, receiverId, nonce, actions, blockHash);
  }

  public getGas = (gas?: string) => (gas ? new BN(gas) : new BN('100000000000000'));
  public getAmount = (amount?: string | null) => {
    if (amount) {
      const parseAmount = utils.format.parseNearAmount(amount);
      return parseAmount ? new BN(parseAmount) : new BN('0');
    } else {
      return new BN('0');
    }
  };

  public async executeMultipleTransactions(allTransactions: Transaction[]) {
    const currentTransactions = await Promise.all(
      allTransactions.map((t, i) => {
        return this.createNearTransaction({
          receiverId: t.receiverId,
          nonceOffset: i + 1,
          actions: t.functionCalls.map((fc) =>
            transactions.functionCall(
              fc.methodName,
              fc?.args ? fc?.args : {},
              this.getGas(fc.gas),
              this.getAmount(fc?.amount),
            ),
          ),
        });
      }),
    );

    return near.wallet.requestSignTransactions(currentTransactions);
  }
}

export const nearFn = new Near();
