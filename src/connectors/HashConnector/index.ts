import { JsonRpcProvider } from '@ethersproject/providers';
import { hethers } from '@hashgraph/hethers';
import { AccountId, Transaction, TransactionId } from '@hashgraph/sdk';
import { ChainId } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments } from '@web3-react/types';
import EventEmitter from 'eventemitter3';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/dist/types';
import { TransactionResponse } from 'src/utils/hedera';

// hashconnectEvent will expose event-emitter interface
// with this we can handle/emit any event to outside class
// for now this is specifically used for checking hashpack available or now
// see HashConnectEvents.CHECK_EXTENSION
export const hashconnectEvent = new EventEmitter();

export interface HashConfigType {
  networkId: 'testnet' | 'mainnet' | 'previewnet';
  chainId: ChainId.HEDERA_MAINNET | ChainId.HEDERA_TESTNET;
  contractId: string;
}

export enum HashConnectEvents {
  CHECK_EXTENSION = 'checkExtension',
  ACTIVATE_CONNECTOR = 'activateConnector',
}

//Intial App config
const APP_METADATA: HashConnectTypes.AppMetadata = {
  name: 'Pangolin Exchange',
  description: '',
  icon: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0x60781C2586D68229fde47564546784ab3fACA982/logo_48.png',
};

export class HashConnector extends AbstractConnector {
  private provider!: JsonRpcProvider;
  private chainId!: ChainId.HEDERA_MAINNET | ChainId.HEDERA_TESTNET;
  private normalizeChainId!: boolean;
  private normalizeAccount!: boolean;
  private network!: 'testnet' | 'mainnet' | 'previewnet';
  private instance!: HashConnect;
  private topic: string;
  private pairingString: string;
  private pairingData: HashConnectTypes.SavedPairingData | null = null;

  public availableExtension: boolean;
  public emittedActivateConnector: boolean;
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
    this.instance = new HashConnect();

    this.chainId = args?.config?.chainId;
    this.normalizeChainId = args?.normalizeChainId;
    this.normalizeAccount = args?.normalizeAccount;
    this.network = args?.config?.networkId;
    this.availableExtension = false;
    this.topic = '';
    this.pairingString = '';
    this.pairingData = null;
    this.emittedActivateConnector = false;

    this.handlePairingEvent = this.handlePairingEvent.bind(this);
    this.handleFoundExtensionEvent = this.handleFoundExtensionEvent.bind(this);
    this.handleFoundIframeEvent = this.handleFoundIframeEvent.bind(this);
    this.handleConnectionStatusChangeEvent = this.handleConnectionStatusChangeEvent.bind(this);
    this.init();
  }

  public async init() {
    // keep debugging logs off by passing false
    this.instance = new HashConnect(false);
    this.setUpEvents();
    const data = await this.instance.init(APP_METADATA, this.network as any);
    this.initData = data;
    this.topic = data.topic;
    this.pairingString = data.pairingString;
    this.pairingData = data.savedPairings[0];
  }

  private handleFoundExtensionEvent() {
    console.log('pangolin hashconnect available extension');
    this.availableExtension = true;
    console.log('pangolin hashconnect emitting event CHECK_EXTENSION');
    hashconnectEvent.emit(HashConnectEvents.CHECK_EXTENSION, true);
  }

  private handleConnectionStatusChangeEvent(state: HashConnectConnectionState) {
    console.log('pangolin hashconnect ConnectionStatusChange');
    // we need to check this.initData too, because it call deactivate and deactivate call clearConnectionsAndData
    // clearConnectionsAndData emit the HashConnectConnectionState.Disconnected and it cause a infinite loop
    if (state === HashConnectConnectionState.Disconnected && this.initData) {
      this.deactivate();
    }
  }

  private handleFoundIframeEvent(data) {
    console.log('pangolin hashconnect handleFoundIframeEvent', data);
    console.log('pangolin hashconnect emitting event ACTIVATE_CONNECTOR');
    if (!this.emittedActivateConnector) {
      this.emittedActivateConnector = true;
      hashconnectEvent.emit(HashConnectEvents.ACTIVATE_CONNECTOR, true);
    }
  }

  private handlePairingEvent(data) {
    console.log('pangolin hashconnect handlePairingEvent', data);
    this.pairingData = data.pairingData!;
    const accountId = this.pairingData?.accountIds?.[0];
    if (accountId) {
      this.emitUpdate({ account: this.toAddress(accountId) });
    }
  }

  setUpEvents() {
    console.log('pangolin hashconnect setting up events');
    this.instance.foundExtensionEvent.on(this.handleFoundExtensionEvent);
    this.instance.foundIframeEvent.on(this.handleFoundIframeEvent);
    this.instance.pairingEvent.on(this.handlePairingEvent.bind(this));
    this.instance.connectionStatusChangeEvent.on(this.handleConnectionStatusChangeEvent.bind(this));
  }

  destroyEvents() {
    this.instance.foundExtensionEvent.off(this.handleFoundExtensionEvent.bind(this));
    this.instance.foundIframeEvent.off(this.handleFoundIframeEvent.bind(this));
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
    // here we need to check emittedActivateConnector to stop multiple alert modal
    // for case1 : if its load in iframe it has already call init from constrcutor so it should not call init here
    // for case2 : if its load normally it should call init here because emittedActivateConnector is always false
    if (!isAuthorized && !this.emittedActivateConnector) {
      // we always need to init with new data if we are not authorized
      await this.init();
      this.instance.connectToLocalWallet();
    }

    // workaround, it has not been initialized, we need to initialize it so we can
    // activate this connector without appearing the popup to connect the wallet
    if (!this.initData) {
      console.log('call init1');
      await this.init();
    }

    if (this.initData) {
      // generate a pairing string, which you can display and generate a QR code from
      this.pairingString = this.instance.generatePairingString(this.initData.topic, this.network, false);

      this.topic = this.initData.topic;
      this.pairingString = this.initData.pairingString;
    }

    this.provider = await this.getProvider();
    const accountId = await this.getAccount();
    return { chainId: this.chainId, provider: this.provider, account: accountId };
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

  private _close() {
    if (this.pairingData) {
      this.instance.disconnect(this.pairingData?.topic);
      this.instance.clearConnectionsAndData();
      localStorage.removeItem('hashconnectData');
      this.initData = null;
      this.pairingData = null;
      this.topic = '';
      this.pairingString = '';
      this.emitDeactivate();
    }
  }

  public async deactivate() {
    this._close();
  }

  public async close() {
    this._close();
  }

  public async isAuthorized(): Promise<boolean> {
    // we query the localStorage to check the hashconnect data exist, if exist, we need to check this data
    const foundData = localStorage.getItem('hashconnectData');
    if (foundData) {
      const data = JSON.parse(foundData);
      // is authorized if the data is valid or data.pairingData length is greater than 0
      if (!data.pairingData || !data.encryptionKey || data.pairingData.length === 0) {
        return false;
      }
      return true;
    } else {
      // if not found data in local storage return false
      return false;
    }
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
