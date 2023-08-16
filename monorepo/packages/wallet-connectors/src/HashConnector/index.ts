import { JsonRpcProvider } from '@ethersproject/providers';
import { hethers } from '@hashgraph/hethers';
import { AccountId, Client, Transaction, TransactionId } from '@hashgraph/sdk';
import { ChainId } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments } from '@web3-react/types';
import EventEmitter from 'eventemitter3';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/dist/types';
import { TransactionResponse } from 'src/library/hedera';

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

export const mainnetHederaConfig = {
  networkId: 'mainnet',
  chainId: ChainId.HEDERA_MAINNET,
  contractId: 'contract -id',
} as const;

export const testnetHederaConfig = {
  networkId: 'testnet',
  chainId: ChainId.HEDERA_TESTNET,
  contractId: 'contract -id',
} as const;

export const CONFIG_MAPPING = {
  [ChainId.HEDERA_MAINNET]: mainnetHederaConfig,
  [ChainId.HEDERA_TESTNET]: testnetHederaConfig,
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
  private nodeAccountIds: AccountId[] = [new AccountId(3)];

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

    const lastConnectedChainId = Number(localStorage.getItem('lastConnectedChainId'));
    if (lastConnectedChainId === ChainId.HEDERA_MAINNET || lastConnectedChainId === ChainId.HEDERA_TESTNET) {
      this.chainId = lastConnectedChainId;
      this.network = lastConnectedChainId === ChainId.HEDERA_MAINNET ? 'mainnet' : 'testnet';
    } else {
      this.chainId = args?.config?.chainId;
      this.network = args?.config?.networkId;
    }

    this.normalizeChainId = args?.normalizeChainId;
    this.normalizeAccount = args?.normalizeAccount;
    this.availableExtension = false;
    this.topic = '';
    this.pairingString = '';
    this.pairingData = null;
    this.emittedActivateConnector = false;

    this.handlePairingEvent = this.handlePairingEvent.bind(this);
    this.handleFoundExtensionEvent = this.handleFoundExtensionEvent.bind(this);
    this.handleFoundIframeEvent = this.handleFoundIframeEvent.bind(this);
    this.handleConnectionStatusChangeEvent = this.handleConnectionStatusChangeEvent.bind(this);

    this.changeClient();
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
      this._close();
      this.emitDeactivate();
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

    if (this.pairingData?.accountIds?.length === 0 || !this.pairingData?.accountIds) {
      this.emitDeactivate();
    } else {
      const accountId = this.pairingData?.accountIds?.[0];
      this.emitUpdate({ account: this.toAddress(accountId) });
    }
  }

  setUpEvents() {
    console.log('pangolin hashconnect setting up events');
    this.instance.foundExtensionEvent.on(this.handleFoundExtensionEvent);
    this.instance.foundIframeEvent.on(this.handleFoundIframeEvent);
    this.instance.pairingEvent.on(this.handlePairingEvent.bind(this));
    this.instance.connectionStatusChangeEvent.once(this.handleConnectionStatusChangeEvent.bind(this));
  }

  destroyEvents() {
    this.instance.foundExtensionEvent.off(this.handleFoundExtensionEvent.bind(this));
    this.instance.foundIframeEvent.off(this.handleFoundIframeEvent.bind(this));
    this.instance.pairingEvent.off(this.handlePairingEvent.bind(this));
    this.instance.connectionStatusChangeEvent.off(this.handleConnectionStatusChangeEvent.bind(this));
  }

  /**
   * This function change the client of connector
   * When change the chain we need to change the client too
   */
  private changeClient() {
    const client = this.chainId === ChainId.HEDERA_MAINNET ? Client.forMainnet() : Client.forTestnet();
    // we get the client and the node ids provide by the .network to send this to transactions
    this.nodeAccountIds = Object.values(client.network).filter((node) => node instanceof AccountId) as AccountId[];
  }

  public async getChainId() {
    return this.chainId;
  }

  public get activeChainId() {
    return this.chainId;
  }

  public async getProvider() {
    let url = `https://hedera-mainnet-rpc.pangolin.network/`;
    if (this.chainId === ChainId.HEDERA_TESTNET) {
      url = `https://hedera-testnet-rpc.pangolin.network/`;
    }
    return new JsonRpcProvider(
      { url, timeout: 5000 },
      {
        chainId: this.chainId,
        name: 'Hedera',
      },
    );
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

    // hashpack uses local storage to save some information, as we are using the same connector
    // for testnet and mainnnet we need to clean this local storage whenever we change chains
    const chainIdConneted = localStorage.getItem('lastConnectedChainId');
    if (chainIdConneted && chainIdConneted !== this.chainId.toString()) {
      localStorage.removeItem('hashconnectData');
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
    console.debug('HASHPACK PAIRING STRING', this.pairingString);
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
      localStorage.removeItem('lastConnectedChainId');
      this.initData = null;
      this.pairingData = null;
      this.topic = '';
      this.pairingString = '';
    }
  }

  public deactivate() {
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
    transaction.setNodeAccountIds(this.nodeAccountIds);

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

  /**
   * This function change the config of connector to chain config
   * @param chainId Chaind id to get config
   */
  public changeConfig(chainId: ChainId) {
    if (chainId !== ChainId.HEDERA_MAINNET && chainId !== ChainId.HEDERA_TESTNET) {
      return;
    }

    const config = CONFIG_MAPPING[chainId];
    this.chainId = chainId;
    this.network = config.networkId;

    this.changeClient();
  }

  public async changeChain(chainId: ChainId) {
    // need to clear the vars and some data from local storage before change chain
    this._close();

    this.changeConfig(chainId);

    localStorage.setItem('lastConnectedChainId', chainId.toString());

    // hashconnect don't use same values (pairingData and private key) because user can
    // select another wallet or don't have a wallet with this private key in another chain
    // so we need to request new connection ever to change the chain
    await this.activate();

    const accountId = this.pairingData?.accountIds?.[0];
    const address = accountId ? this.toAddress(accountId) : null;

    this.emitUpdate({ chainId, account: address });
  }
}
