import { ChainId, NetworkType } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import EventEmitter from 'eventemitter3';
import { isMobile } from 'react-device-detect';

export type activeFunctionType = (
  connector: AbstractConnector,
  onError?: (error: Error) => void,
  throwErrors?: boolean,
) => Promise<void>;

export type PangolinConnector = AbstractConnector & { isAuthorized?: () => Promise<boolean> };

export const walletEvent = new EventEmitter();

export enum WalletEvents {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

export abstract class Wallet {
  readonly connector: PangolinConnector;
  readonly name: string;
  readonly href: string | null;
  readonly icon: string;
  readonly description: string;
  readonly supportedChains: NetworkType[];
  readonly supportedChainsId: number[] | undefined;
  private wallletIsActive = false;

  /**
   * @param connector The connector in AbstractConnector object
   * @param name Name of wallet
   * @param href Link of the wallet website
   * @param icon Link of the wallet icon
   * @param description Breef description of wallet
   * @param supportedChains Array of NetworkType that this wallet support
   * @param supportedChainsId Array of Chain ids that this wallet support
   */
  constructor(args: {
    connector: PangolinConnector;
    name: string;
    href: string | null;
    icon: string;
    description: string;
    supportedChains: NetworkType[];
    supportedChainsId?: number[];
  }) {
    const { connector, name, href, icon, description, supportedChains, supportedChainsId } = args;

    this.connector = connector;
    this.name = name;
    this.href = href;
    this.icon = icon;
    this.description = description;
    this.supportedChains = supportedChains;
    this.supportedChainsId = supportedChainsId;

    // On disconnect the wallet we need to set the `isActive` to false
    // To do this, when disconnect the connector, this emits the Web3ReactDeactivate event by default
    this.connector.on('Web3ReactDeactivate', () => (this.wallletIsActive = false));
  }

  /**
   * Function that will be executed when try to connect to wallet.
   *
   * These parameters will be filled by the wallet modal
   *
   * @param activate useWeb3React function that activates the connector and the wallet
   * @param onSuccess function to execute on success
   * @param onError function to exeute on error
   */
  async tryActivation({
    activate,
    onSuccess,
    onError,
  }: {
    activate: activeFunctionType;
    onSuccess?: () => void;
    onError?: (error: unknown) => Promise<void>;
    chainId?: ChainId;
  }) {
    try {
      await activate(this.connector, undefined, true);
      onSuccess && onSuccess();
      walletEvent.emit(WalletEvents.CONNECTED, this);
      this.wallletIsActive = true;
    } catch (error) {
      if (onError) {
        await onError(error);
      }
    }
  }

  showWallet() {
    return !isMobile;
  }

  /**
   * Return if this wallet is installed
   */
  abstract installed(): boolean;

  /**
   * Function to disconnect the wallet
   */
  disconnect() {
    this.wallletIsActive = false;
    walletEvent.emit(WalletEvents.DISCONNECTED, this);
  }

  public get isActive() {
    return this.wallletIsActive;
  }
}
