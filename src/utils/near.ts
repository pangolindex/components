import BN from 'bn.js';
import { baseDecode } from 'borsh';
import { Contract, transactions } from 'near-api-js';
import { Action, createTransaction } from 'near-api-js/lib/transaction';
import { PublicKey } from 'near-api-js/lib/utils';
import { NEAR_EXCHANGE_CONTRACT_ADDRESS, near } from 'src/connectors';

export interface ViewFunctionOptions {
  methodName: string;
  args?: object;
}

export interface FunctionCallOptions extends ViewFunctionOptions {
  gas?: string;
  amount?: string;
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

  public async getNearMetadata(tokenAddress: string) {
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

  public async getNearTokenBalance(tokenAddress: string, account?: string) {
    return this.viewFunction(tokenAddress, {
      methodName: 'ft_balance_of',
      args: {
        account_id: account,
      },
    });
  }

  public async getNearTotalSupply(tokenAddress: string) {
    return this.viewFunction(tokenAddress, {
      methodName: 'ft_total_supply',
      args: {},
    });
  }

  public async NearExchangeContract(deployer, exchange) {
    const EXCHANGE = new Contract(deployer, exchange, {
      viewMethods: ['get_pools', 'get_number_of_pools'],
      changeMethods: [],
    });
    return EXCHANGE as any;
  }

  public async getAllPools(chainId: number) {
    const deployer = await near.wallet.account();
    const EXCHANGE = await this.NearExchangeContract(deployer, NEAR_EXCHANGE_CONTRACT_ADDRESS[chainId]);
    const numberOfPools = await EXCHANGE.get_number_of_pools();
    return EXCHANGE.get_pools({
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
    actions: Action[];
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

    const publicKey = PublicKey.from(accessKey.public_key);
    const nonce = accessKey.access_key.nonce + nonceOffset;

    return createTransaction(accountId, publicKey, receiverId, nonce, actions, blockHash);
  }

  public getGas = (gas?: string) => (gas ? new BN(gas) : new BN('100000000000000'));
  public getAmount = (amount?: string) => (amount ? new BN(amount) : new BN('0'));

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
              this.getAmount(fc.amount),
            ),
          ),
        });
      }),
    );

    return near.wallet.requestSignTransactions(currentTransactions);
  }
}

export const nearFn = new Near();
