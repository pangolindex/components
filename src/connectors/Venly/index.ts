import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { NoEthereumProviderError } from '@pangolindex/web3-react-injected-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import warning from 'tiny-warning';
import { UserRejectedRequestError } from '../DefiConnector';

const venlyClientID = process.env.VENLY_ID ?? 'Testaccount';

export class VenlyConnector extends AbstractConnector {
  private web3Provider!: Web3Provider;
  private venlyOptions = {
    clientId: venlyClientID,
    skipAuthentication: process.env.NODE_ENV !== 'production',
    environment: process.env.NODE_ENV === 'production' ? 'prod' : 'staging',
    secretType: 'AVAC' as any,
    signMethod: 'POPUP',
  };

  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  private convertProvider(provider: any): ExternalProvider {
    return {
      sendAsync: (request: { method: string; params?: Array<any> }, callback: (error: any, response: any) => void) => {
        provider.sendAsync(
          {
            method: request.method,
            params: request.params ?? [],
            id: 1,
            jsonrpc: '2.0',
          },
          callback,
        );
      },
    };
  }

  private handleChainChanged(chainId: string | number): void {
    console.log("Handling 'chainChanged' event with payload", chainId);
    this.emitUpdate({ chainId, provider: window?.bitkeep?.ethereum });
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
    this.emitUpdate({ chainId: networkId, provider: window?.bitkeep?.ethereum });
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.web3Provider) {
      const _provider = null;
      this.web3Provider = new Web3Provider(this.convertProvider(_provider));
    }

    // try to activate + get account via eth_requestAccounts
    let account: string | undefined;
    try {
      const _account = await this.getAccount();
      if (_account) account = _account;
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError();
      } else {
        warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable');
      }
    }

    return { provider: this.web3Provider, account };
  }

  public async getProvider() {
    return this.web3Provider;
  }

  public async getChainId(): Promise<number | string> {
    if (!this.web3Provider || !this.web3Provider.provider) {
      throw new NoEthereumProviderError();
    }

    const chainId = await this.web3Provider.send('eth_chainId', []);

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!this.web3Provider || !this.web3Provider.provider) {
      throw new NoEthereumProviderError();
    }

    const accounts: string[] | undefined = await this.web3Provider.send('eth_accounts', []);
    return accounts && accounts.length > 0 ? accounts[0] : null;
  }

  public deactivate() {
    return null;
  }

  public async isAuthorized(): Promise<boolean> {
    if (!this.web3Provider || !this.web3Provider.provider) {
      return false;
    }

    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }
}
