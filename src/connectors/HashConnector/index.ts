import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments } from '@web3-react/types';
import { HashConnect, HashConnectTypes } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/dist/provider';
import { HashConnectConnectionState } from 'hashconnect/dist/types';

export interface HashConfigType {
  networkId: string;
  chainId: number;
  contractId: string;
}

//Intial App config
const APP_METADATA: HashConnectTypes.AppMetadata = {
  name: 'Pangolin Exchange',
  description: '',
  icon: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0x60781C2586D68229fde47564546784ab3fACA982/logo_48.png',
};

export class HashConnector extends AbstractConnector {
  private provider!: HashConnectProvider;
  private chainId!: number;
  private normalizeChainId!: boolean;
  private normalizeAccount!: boolean;
  private network!: string; //"testnet" | "mainnet" | "previewnet"
  private instance!: HashConnect;
  private appMetadata: HashConnectTypes.AppMetadata;
  private state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
  private topic: string;
  private pairingString: string;
  private pairingData: HashConnectTypes.SavedPairingData | null = null;
  public availableExtension: HashConnectTypes.WalletMetadata | undefined;
  private initData: HashConnectTypes.InitilizationData | null = null;

  public constructor(
    kwargs: AbstractConnectorArguments & {
      normalizeChainId: boolean;
      normalizeAccount: boolean;
      config: HashConfigType;
    },
  ) {
    super(kwargs);

    //create the hashconnect instance
    this.instance = new HashConnect(true);
    this.chainId = kwargs?.config?.chainId;
    this.normalizeChainId = kwargs?.normalizeChainId;
    this.normalizeAccount = kwargs?.normalizeAccount;
    this.network = kwargs?.config?.networkId;
    this.appMetadata = APP_METADATA;
    this.availableExtension = undefined;
    this.topic = '';
    this.pairingString = '';

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
    console.log('Found extension', data);
    this.availableExtension = data;
  }

  private handleConnectionStatusChangeEvent(state: HashConnectConnectionState) {
    console.log('hashconnect state change event', state);
    this.state = state;
    if (state === HashConnectConnectionState.Disconnected) {
      this.emitDeactivate();
    }
  }

  private handlePairingEvent(data) {
    console.log('Paired with wallet', data);

    this.pairingData = data.pairingData!;

    if (this.pairingData && this.pairingData?.accountIds[0]) {
      const accountId = this.pairingData?.accountIds[0];
      this.emitUpdate({ account: accountId });
    }
  }

  public async getChainId(): Promise<number | string | any> {
    if (this.pairingData) {
      return this.chainId;
    }
    return null;
  }

  public async getProvider(): Promise<any> {
    if (this.pairingData && this.pairingData?.accountIds[0]) {
      const provider = this.instance.getProvider(this.network, this.topic, this.pairingData?.accountIds[0]);
      return provider;
    }
  }

  public async activate(): Promise<any> {
    if (this.initData) {
      // const initData = await this.instance.init(APP_METADATA, this.network as any);
      this.instance.connectToLocalWallet();
      // generate a pairing string, which you can display and generate a QR code from
      this.pairingString = this.instance.generatePairingString(this.initData.topic, this.network, false);

      this.topic = this.initData.topic;
      //Saved pairings will return here, generally you will only have one unless you are doing something advanced
      this.pairingData = this.initData.savedPairings[0];

      this.provider = await this.getProvider();
      const accountId = this.pairingData?.accountIds[0];

      return { chainId: this.chainId, provider: this.provider, account: accountId };
    }
  }

  logEvent(data) {
    console.log(data);
  }

  setUpEvents() {
    console.log('setting up events');
    this.instance.foundExtensionEvent.on(this.handleFoundExtensionEvent.bind(this));
    this.instance.pairingEvent.on(this.handlePairingEvent.bind(this));

    this.instance.acknowledgeMessageEvent.on(this.logEvent);
    this.instance.additionalAccountRequestEvent.on(this.logEvent);
    this.instance.connectionStatusChangeEvent.on(this.handleConnectionStatusChangeEvent.bind(this));
    this.instance.authRequestEvent.on(this.logEvent);
    this.instance.transactionEvent.on(this.logEvent);
  }

  destroyEvents() {
    this.instance.foundExtensionEvent.off(this.handleFoundExtensionEvent.bind(this));
    this.instance.pairingEvent.off(this.handlePairingEvent.bind(this));

    this.instance.acknowledgeMessageEvent.off(this.logEvent);
    this.instance.additionalAccountRequestEvent.off(this.logEvent);
    this.instance.connectionStatusChangeEvent.off(this.handleConnectionStatusChangeEvent.bind(this));
    this.instance.authRequestEvent.off(this.logEvent);
    this.instance.transactionEvent.off(this.logEvent);
  }

  public async getAccount(): Promise<null | string> {
    if (this.pairingData) {
      return this.pairingData?.accountIds[0];
    }
    return null;
  }

  public async deactivate() {
    if (this.pairingData) {
      this.instance.disconnect(this.pairingData?.topic);
      this.pairingData = null;
    }
  }

  public async close() {
    if (this.pairingData) {
      this.instance.disconnect(this.pairingData?.topic);
      this.pairingData = null;
    }
  }

  public async getAccountBalance() {
    if (this.pairingData) {
      const balance = await this.provider.getAccountBalance(this.pairingData?.accountIds[0]);
      return balance;
    }
    return undefined;
  }

  public async isAuthorized(): Promise<boolean> {
    if (this.pairingData) {
      return true;
    }
    return false;
  }
}
