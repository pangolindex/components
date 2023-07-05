import { ChainId } from '@pangolindex/sdk';
import { UserRejectedRequestError } from '@pangolindex/web3-react-injected-connector';
import WalletProvider, { EthereumProvider } from '@walletconnect/ethereum-provider';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';

export interface WalletConnectConnectorArguments {
  rpcMap: { [chainId: number]: string };
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
    verifyUrl?: string;
  };
}

export class WalletConnectConnector extends AbstractConnector {
  public provider?: WalletProvider;
  private config: WalletConnectConnectorArguments;

  constructor(config: WalletConnectConnectorArguments) {
    const supportedChainIds = Object.keys(config.rpcMap).map((k) => Number(k));
    super({ supportedChainIds: supportedChainIds });
    this.config = config;
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);

    if (this.config.projectId.length > 0) {
      this.init();
    }
  }

  private async init() {
    const supportedChainIds = this.getSupportedChainIds();

    const rpcMap = Object.entries(this.config.rpcMap).reduce((acc, [chainId, rpc]) => {
      acc[`eip155:${chainId}`] = rpc;
      return acc;
    }, {} as { [chainId: string]: string });

    this.provider = await EthereumProvider.init({
      projectId: this.config.projectId,
      chains: [ChainId.ETHEREUM],
      optionalChains: supportedChainIds,
      showQrModal: false,
      rpcMap: rpcMap,
      metadata: this.config.metadata,
    });
  }

  protected getSupportedChainIds() {
    return Object.keys(this.config.rpcMap).map((k) => Number(k));
  }

  private handleChainChanged(chainId: number | string): void {
    console.log("Handling 'chainChanged' event with payload", chainId);
    this.emitUpdate({ chainId });
  }

  private handleAccountsChanged(accounts: string[]): void {
    console.log("Handling 'accountsChanged' event with payload", accounts);
    this.emitUpdate({ account: accounts[0] });
  }

  private handleDisconnect(): void {
    console.log("Handling 'disconnect' event");
    // we have to do this because of a @walletconnect/web3-provider bug
    if (this.provider) {
      this.provider.removeListener('chainChanged', this.handleChainChanged);
      this.provider.removeListener('accountsChanged', this.handleAccountsChanged);
      this.provider = undefined;
    }
    this.emitDeactivate();
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (this.config.projectId.length === 0) {
      throw new Error('Please add the walletconnect projectId');
    }

    if (!this.provider) {
      await this.init();
    }

    let account: string | undefined;
    try {
      const accounts = await this.provider!.enable();
      account = accounts[0];
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError();
      } else {
        throw error;
      }
    }

    this.provider!.on('disconnect', this.handleDisconnect);
    this.provider!.on('chainChanged', this.handleChainChanged);
    this.provider!.on('accountsChanged', this.handleAccountsChanged);

    return { provider: this.provider!, account };
  }

  public async getProvider(): Promise<any> {
    return this.provider;
  }

  public async getChainId(): Promise<number | string> {
    return this.provider!.chainId;
  }

  public async getAccount(): Promise<null | string> {
    const accounts = this.provider!.accounts;
    return accounts[0];
  }

  public deactivate() {
    if (this.provider) {
      this.provider.removeListener('disconnect', this.handleDisconnect);
      this.provider.removeListener('chainChanged', this.handleChainChanged);
      this.provider.removeListener('accountsChanged', this.handleAccountsChanged);
      this.provider.disconnect();
    }
  }

  public async isAuthorized() {
    return this.provider && this.provider.connected ? this.provider.connected : false;
  }

  public async close() {
    this.emitDeactivate();
  }

  public onQRCodeURI(setQRCode: (uri: string) => void) {
    if (this.provider) {
      this.provider.on('display_uri', (uri) => {
        setQRCode(uri);
      });
    }
  }

  public set projectId(v: string) {
    this.config.projectId = v;
  }
}
