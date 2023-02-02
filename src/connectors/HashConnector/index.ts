import { JsonRpcProvider } from '@ethersproject/providers';
import { hethers } from '@hashgraph/hethers';
import { AccountId, Transaction, TransactionId } from '@hashgraph/sdk';
import { ChainId } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments } from '@web3-react/types';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/dist/types';
import { TransactionResponse } from 'src/utils/hedera';

export interface HashConfigType {
  networkId: string;
  chainId: number;
  contractId: string;
}

const LocalStorageKey = 'pangolinHashPackData';
//Intial App config
const APP_METADATA: HashConnectTypes.AppMetadata = {
  name: 'Pangolin Exchange',
  description: '',
  icon: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0x60781C2586D68229fde47564546784ab3fACA982/logo_48.png',
};

type HashPackLocalDataType = {
  topic?: string;
  pairingData?: HashConnectTypes.SavedPairingData | null;
  pairingString?: string;
};

export class HashConnector extends AbstractConnector {
  private provider!: JsonRpcProvider;
  private chainId!: number;
  private normalizeChainId!: boolean;
  private normalizeAccount!: boolean;
  private network!: string; //"testnet" | "mainnet" | "previewnet"
  private instance!: HashConnect;
  private topic: string;
  private pairingString: string;
  private pairingData: HashConnectTypes.SavedPairingData | null = null;

  public availableExtension: boolean;
  private initData: HashConnectTypes.InitilizationData | null = null;

  public constructor(
    args: AbstractConnectorArguments & {
      normalizeChainId: boolean;
      normalizeAccount: boolean;
      config: HashConfigType;
    },
  ) {
    super(args);

    //create the hashconnect instance
    this.instance = new HashConnect(false);

    this.chainId = args?.config?.chainId;
    this.normalizeChainId = args?.normalizeChainId;
    this.normalizeAccount = args?.normalizeAccount;
    this.network = args?.config?.networkId;
    this.availableExtension = false;
    this.topic = '';
    this.pairingString = '';
    this.pairingData = null;

    this.handlePairingEvent = this.handlePairingEvent.bind(this);
    this.handleFoundExtensionEvent = this.handleFoundExtensionEvent.bind(this);
    this.handleConnectionStatusChangeEvent = this.handleConnectionStatusChangeEvent.bind(this);

    this.setUpEvents();

    this.instance
      .init(APP_METADATA, this.network as any)
      .then((data) => {
        this.initData = data;
      })
      .catch((error) => {
        console.log('hash connect err', error);
      });
  }

  private handleFoundExtensionEvent(data) {
    console.log('hashpack avaialble extension', data);
    this.availableExtension = true;
  }

  private handleConnectionStatusChangeEvent(state: HashConnectConnectionState) {
    if (state === HashConnectConnectionState.Disconnected) {
      this.deactivate();
    }
  }

  private handlePairingEvent(data) {
    this.pairingData = data.pairingData!;
    const accountId = this.pairingData?.accountIds?.[0];
    if (accountId) {
      this.saveDataInLocalstorage({ pairingData: this.pairingData });
      this.emitUpdate({ account: this.toAddress(accountId) });
    }
  }

  setUpEvents() {
    this.instance.foundExtensionEvent.on(this.handleFoundExtensionEvent.bind(this));
    this.instance.pairingEvent.on(this.handlePairingEvent.bind(this));
    this.instance.connectionStatusChangeEvent.on(this.handleConnectionStatusChangeEvent.bind(this));
  }

  destroyEvents() {
    this.instance.foundExtensionEvent.off(this.handleFoundExtensionEvent.bind(this));
    this.instance.pairingEvent.off(this.handlePairingEvent.bind(this));
    this.instance.connectionStatusChangeEvent.off(this.handleConnectionStatusChangeEvent.bind(this));
  }

  public getChainId(): number | string | any {
    if (this.pairingData) {
      return this.chainId;
    }
    return null;
  }

  public async getProvider() {
    let url = `https://mainnet.hashio.io/api`;
    if (this.chainId === ChainId.HEDERA_TESTNET) {
      url = `https://testnet.hashio.io/api`;
    }
    return new JsonRpcProvider(`${url}`);
  }

  public async activate(): Promise<any> {
    const isAuthorized = await this.isAuthorized();

    if (!isAuthorized && this.initData) {
      this.instance.connectToLocalWallet();

      await this.instance.init(APP_METADATA, this.network as any);
      // generate a pairing string, which you can display and generate a QR code from
      this.pairingString = this.instance.generatePairingString(this.initData.topic, this.network, false);

      this.topic = this.initData.topic;
      this.pairingString = this.initData.pairingString;

      this.provider = await this.getProvider();
      this.saveDataInLocalstorage();

      return { chainId: this.chainId, provider: this.provider };
    } else {
      await this.instance.init(APP_METADATA, this.network as any);
      this.provider = await this.getProvider();
      const accountId = await this.getAccount();

      return { chainId: this.chainId, provider: this.provider, account: accountId };
    }
  }

  toAddress = (accountId: string) => {
    return hethers.utils.getAddressFromAccount(accountId);
  };

  public async getAccount(): Promise<null | string> {
    if (this.pairingData) {
      try {
        const newAccountId = this.pairingData?.accountIds?.[0];
        return this.toAddress(newAccountId);
      } catch (err) {
        console.log('error', err);
      }
    }
    return null;
  }

  public async deactivate() {
    if (this.pairingData) {
      this.instance.disconnect(this.pairingData?.topic);
      this.instance.clearConnectionsAndData();
      localStorage.removeItem(LocalStorageKey);
      this.emitDeactivate();
    }
  }

  public async close() {
    if (this.pairingData) {
      this.instance.disconnect(this.pairingData?.topic);
      this.instance.clearConnectionsAndData();
      localStorage.removeItem(LocalStorageKey);
      this.emitDeactivate();
    }
  }

  public async isAuthorized(): Promise<boolean> {
    return this.loadLocalData();
  }

  saveDataInLocalstorage(params: HashPackLocalDataType = {}) {
    const saveData = {
      topic: params.topic || this.topic,
      pairingData: params.pairingData || this.pairingData,
      pairingString: params.pairingString || this.pairingString,
    };
    const data = JSON.stringify(saveData);

    localStorage.setItem(LocalStorageKey, data);
  }

  loadLocalData(): boolean {
    const foundData = localStorage.getItem(LocalStorageKey);

    if (foundData) {
      const saveData: HashPackLocalDataType = JSON.parse(foundData);
      this.topic = saveData.topic || '';
      this.pairingString = saveData.pairingString || '';
      if (saveData.pairingData) {
        this.pairingData = saveData.pairingData;
      }
      return true;
    }
    return false;
  }

  private makeBytes(transaction: Transaction, accountId: string) {
    const transactionId = TransactionId.generate(accountId);
    transaction.setTransactionId(transactionId);
    transaction.setNodeAccountIds([new AccountId(3)]);

    transaction.freeze();

    return transaction.toBytes();
  }

  public async sendTransaction(
    transaction: Transaction,
    accountId: string,
    returnTransaction = false,
    hideNfts = false,
  ) {
    const bytes = this.makeBytes(transaction, accountId);

    const transactionToSend: MessageTypes.Transaction = {
      topic: this.topic,
      byteArray: bytes,
      metadata: {
        accountToSign: accountId,
        returnTransaction: returnTransaction,
        hideNft: hideNfts,
      },
    };

    const res = await this.instance.sendTransaction(this.topic, transactionToSend);

    const receipt = res?.response as TransactionResponse;
    if (res.success) {
      return {
        hash: receipt.transactionId,
      };
    }

    return null;
  }

  public getSigner() {
    if (this.pairingData && this.topic) {
      const newAccountId = this.pairingData?.accountIds?.[0];
      const provider = this.instance.getProvider(this.network, this.topic, newAccountId);
      const signer = this.instance.getSigner(provider);
      return signer;
    }
    return null;
  }
}
