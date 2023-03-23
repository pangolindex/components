import { NetworkType } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { isMobile } from 'react-device-detect';

export type activeFunctionType = (
  connector: AbstractConnector,
  onError?: (error: Error) => void,
  throwErrors?: boolean,
) => Promise<void>;

export type PangolinConnector = AbstractConnector & { isAuthorized?: () => Promise<boolean> };

export abstract class Wallet {
  readonly connector: PangolinConnector;
  readonly name: string;
  readonly href: string | null;
  readonly icon: string;
  readonly description: string;
  readonly supportedChains: NetworkType[];
  readonly supportedChainsId: number[] | undefined;
  isActive = false;

  /**
   * @param connector The connector in AbstractConnector object
   * @param name Name of wallet
   * @param href Link of the wallet website
   * @param icon Link of the wallet icon
   * @param description Breef description of wallet
   * @param supportedChains Array of NetworkType that this chain supports
   */
  constructor(
    connector: PangolinConnector,
    name: string,
    href: string | null,
    icon: string,
    description: string,
    supportedChains: NetworkType[],
    supportedChainsId?: number[],
  ) {
    this.connector = connector;
    this.name = name;
    this.href = href;
    this.icon = icon;
    this.description = description;
    this.supportedChains = supportedChains;
    this.supportedChainsId = supportedChainsId;

    // On disconnect the wallet we need to set the `isActive` to false
    // To do this, when disconnect the connector, this emits the Web3ReactDeactivate event by default
    this.connector.on('Web3ReactDeactivate', () => (this.isActive = false));
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
  async tryActivation(activate: activeFunctionType, onSuccess: () => void, onError: (error: unknown) => void) {
    try {
      await activate(this.connector, undefined, true);
      onSuccess();
      this.isActive = true;
    } catch (error) {
      onError(error);
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
    this.isActive = false;
  }
}
