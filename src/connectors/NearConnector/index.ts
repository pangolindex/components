import * as nearAPI from 'near-api-js';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import { JsonRpcProvider } from 'near-api-js/lib/providers';

export class NearConnector extends AbstractConnector {
  private near!: nearAPI.Near;
  private wallet!: nearAPI.WalletConnection;
  private provider!: JsonRpcProvider;

  public constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    const { connect, keyStores, WalletConnection } = nearAPI;
    // TODO
    let config = {
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
    };

    const keyStore = new keyStores.BrowserLocalStorageKeyStore();

    // connect to NEAR
    connect({ keyStore, headers: {}, ...config }).then((res) => {
      this.near = res;
      this.wallet = new WalletConnection(this.near, 'pangolin');
      //this.connectEagerly();
    });

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

  // public connectEagerly = async () => {};

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
      console.log('isAuthorized', isAuthorized);
      if (isAuthorized) {
        const account = await this.getAccount();
        const chainId = await this.getChainId();
        console.log('connectEagerly', account, isAuthorized, chainId);

        // this.emitUpdate({ chainId: chainId, provider: this.provider, account: account });
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
