import * as React from 'react';

export type NetworkProps = {
  open: boolean;
  closeModal: () => void;
};

export enum NETWORK_TYPE {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}
