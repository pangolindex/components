import { AbstractConnector } from '@web3-react/abstract-connector';
import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import warning from 'tiny-warning';

export const AVALANCHE_NOT_INSTALLED_ERROR = 'Avalanche not installed';

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16);
}

export class NoAvalancheCoreError extends Error {
  public constructor() {
    super(AVALANCHE_NOT_INSTALLED_ERROR);
    this.name = this.constructor.name;
    this.message = AVALANCHE_NOT_INSTALLED_ERROR;
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = 'The user rejected the request.';
  }
}

export class AvalancheCoreConnector extends AbstractConnector {
  private provider!: any;

  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.provider = window.avalanche;
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

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.provider) {
      throw new NoAvalancheCoreError();
    }

    // try to activate + get account via eth_requestAccounts
    let account;
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' });

      if (accounts) {
        account = accounts[0];
      }
    } catch (error) {
      warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable');
    }

    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      const accounts = await this.provider.enable();

      if (accounts) {
        account = accounts[0];
      }
    }

    return { provider: this.provider, ...(account ? { account } : {}) };
  }

  public async getProvider(): Promise<any> {
    return this.provider;
  }

  public async getChainId(): Promise<number | string> {
    if (!this.provider) {
      throw new NoAvalancheCoreError();
    }

    let chainId;
    try {
      chainId = await this.provider.request({ method: 'eth_chainId' });
    } catch {
      warning(false, 'eth_chainId was unsuccessful, falling back to net_version');
    }

    const receivedChainId = parseChainId(chainId);

    return receivedChainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!this.provider) {
      throw new NoAvalancheCoreError();
    }

    let account;
    try {
      const accounts = await this.provider.request({ method: 'eth_accounts' });

      if (accounts) {
        account = accounts[0];
      }
    } catch {
      warning(false, 'eth_accounts was unsuccessful, falling back to enable');
    }

    if (!account) {
      try {
        const accounts = await this.provider.enable();

        if (accounts) {
          account = accounts[0];
        }
      } catch {
        warning(false, 'enable was unsuccessful, falling back to eth_accounts v2');
      }
    }

    if (!account) {
      const accounts = await this.provider.request({ method: 'eth_accounts' });

      if (accounts) {
        account = accounts[0];
      }
    }

    return account;
  }

  public deactivate() {
    console.log('Deactivated');
  }

  public async isAuthorized(): Promise<boolean> {
    const account = await this.getAccount();

    if (!this.provider) {
      throw new NoAvalancheCoreError();
    }

    if (account) {
      return true;
    }
    return false;
  }
}
