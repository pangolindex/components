import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments } from '@web3-react/types';
import { Near, WalletConnection, keyStores } from 'near-api-js';
import { JsonRpcProvider } from 'near-api-js/lib/providers';

export class NearConnector extends AbstractConnector {
  private near!: Near;
  private wallet!: WalletConnection;
  private provider!: JsonRpcProvider;
  private normalizeChainId!: boolean;
  private normalizeAccount!: boolean;

  public constructor(
    kwargs: AbstractConnectorArguments & { normalizeChainId: boolean; normalizeAccount: boolean; config },
  ) {
    super(kwargs);

    const keyStore = new keyStores.BrowserLocalStorageKeyStore();

    // connect to NEAR

    this.near = new Near({ keyStore, headers: {}, ...kwargs.config });
    this.wallet = new WalletConnection(this.near, 'pangolin');
    this.normalizeChainId = kwargs?.normalizeChainId;
    this.normalizeAccount = kwargs?.normalizeAccount;

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.provider = new JsonRpcProvider('https://rpc.testnet.near.org') as JsonRpcProvider;
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
      return this.wallet._networkId;
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
        this.wallet.requestSignIn('example-contract.testnet');

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

  public async isAuthorized(): Promise<boolean> {
    if (this.wallet && this.wallet.isSignedIn()) {
      return true;
    }
    return false;
  }
}
