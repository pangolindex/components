import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments } from '@web3-react/types';
import { Near, WalletConnection, keyStores } from 'near-api-js';
import { JsonRpcProvider } from 'near-api-js/lib/providers';

export interface NearConfigType {
  networkId: string;
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  explorerUrl: string;
  chainId: number;
  contractId: string;
}

export class NearConnector extends AbstractConnector {
  private near!: Near;
  public wallet!: WalletConnection;
  private provider!: JsonRpcProvider;
  private normalizeChainId!: boolean;
  private normalizeAccount!: boolean;
  private chainId!: number;

  public constructor(
    kwargs: AbstractConnectorArguments & {
      normalizeChainId: boolean;
      normalizeAccount: boolean;
      config: NearConfigType;
    },
  ) {
    super(kwargs);

    const keyStore = new keyStores.BrowserLocalStorageKeyStore();

    // connect to NEAR

    this.near = new Near({ keyStore, headers: {}, ...kwargs.config });
    this.wallet = new WalletConnection(this.near, 'pangolin');
    this.normalizeChainId = kwargs?.normalizeChainId;
    this.normalizeAccount = kwargs?.normalizeAccount;
    this.chainId = kwargs?.config?.chainId;

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.provider = new JsonRpcProvider(kwargs.config.nodeUrl) as JsonRpcProvider;
  }

  private handleChainChanged(chainId: string | number): void {
    console.log("Handling 'chainChanged' event with payload", chainId);
    this.emitUpdate({ chainId, provider: this.provider });
  }

  private handleAccountsChanged(accounts: string[]): void {
    console.log("Handling 'accountsChanged' event with payload", accounts);
    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  private handleClose(code: number, reason: string): void {
    console.log("Handling 'close' event with payload", code, reason);
    this.emitDeactivate();
  }

  private handleNetworkChanged(networkId: string | number): void {
    console.log("Handling 'networkChanged' event with payload", networkId);
    this.emitUpdate({ chainId: networkId, provider: this.provider });
  }

  public async getChainId(): Promise<number | string | any> {
    if (this.wallet) {
      return this.chainId;
    }
    return null;
  }

  public async getProvider(): Promise<any> {
    return this.provider;
  }

  public async activate(): Promise<any> {
    if (this.wallet) {
      const isAuthorized = await this.isAuthorized();

      if (isAuthorized) {
        const account = await this.getAccount();
        const chainId = await this.getChainId();

        return { chainId: chainId, provider: this.provider, account: account };
      } else {
        this.wallet.requestSignIn(this.near.config.contractId);

        return { provider: this.provider };
      }
    }
  }

  public async getAccount(): Promise<null | string> {
    if (this.wallet && this.wallet.isSignedIn()) {
      return this.wallet.getAccountId();
    }
    return null;
  }

  public async deactivate() {
    return null;
  }

  public async close() {
    if (this.wallet) {
      this.wallet.signOut();
    }
  }

  public async getAccountBalance() {
    if (this.wallet) {
      const account = this.wallet.account();
      return account.getAccountBalance();
    }
    return undefined;
  }

  public async isAuthorized(): Promise<boolean> {
    if (this.wallet && this.wallet.isSignedIn()) {
      return true;
    }
    return false;
  }
}
