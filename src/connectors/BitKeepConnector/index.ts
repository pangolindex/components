import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import warning from 'tiny-warning';
import { NoEthereumProviderError, UserRejectedRequestError } from '../DefiConnector';

export class BitKeepConnector extends AbstractConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
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
    if (!window?.bitkeep?.ethereum) {
      throw new NoEthereumProviderError();
    }

    if (window?.bitkeep?.ethereum.on) {
      window.bitkeep.ethereum.on('chainChanged', this.handleChainChanged);
      window.bitkeep.ethereum.on('accountsChanged', this.handleAccountsChanged);
      window.bitkeep.ethereum.on('close', this.handleClose);
      window.bitkeep.ethereum.on('networkChanged', this.handleNetworkChanged);
    }

    if (window?.bitkeep?.ethereum.isBitKeep) {
      window.bitkeep.ethereum.autoRefreshOnNetworkChange = false;
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

    return { provider: window.bitkeep.ethereum, account };
  }

  public async getProvider() {
    return window.bitkeep && window.bitkeep.ethereum;
  }

  public async getChainId(): Promise<number | string> {
    if (!window?.bitkeep?.ethereum) {
      throw new NoEthereumProviderError();
    }

    let chainId = window.bitkeep.ethereum.chainId || window.bitkeep.ethereum.networkVersion;

    if (!chainId) {
      chainId = await window.bitkeep?.ethereum.request({ method: 'eth_chainId' });
    }

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!window?.bitkeep?.ethereum) {
      throw new NoEthereumProviderError();
    }

    const accounts: string[] | undefined = await window.bitkeep?.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0 ? accounts[0] : null;
  }

  public deactivate() {
    if (window?.bitkeep?.ethereum && window?.bitkeep?.ethereum.removeListener) {
      window.bitkeep.ethereum.removeListener('chainChanged', this.handleChainChanged);
      window.bitkeep.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
      window.bitkeep.ethereum.removeListener('close', this.handleClose);
      window.bitkeep.ethereum.removeListener('networkChanged', this.handleNetworkChanged);
    }
  }

  public async isAuthorized(): Promise<boolean> {
    if (!window?.bitkeep?.ethereum) {
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
