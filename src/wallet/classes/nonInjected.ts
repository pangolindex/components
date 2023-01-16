import { hashConnect, near, xDefi } from "src/connectors"
import { Wallet } from "./wallet"
import xDefiIcon from 'src/assets/images/xDefi.png';
import nearIcon from 'src/assets/images/near.svg';
import hashIcon from 'src/assets/images/hashConnect.png';

export class XDefiWallet extends Wallet {
  constructor() {
    super(xDefi, "XDEFI Wallet", "https://www.xdefi.io", xDefiIcon, "One wallet for all your Crypto")
  }

  installed(): boolean {
    return !!window.xfi && !!window.xfi.ethereum && !!window.xfi.ethereum.isXDEFI;
  }
}

export class NearWallet extends Wallet {
  constructor() {
    super(near, "Near", "https://wallet.near.org/", nearIcon, "Near Web")
  }

  installed(): boolean {
    return true;
  }
}

export class HashPackWallet extends Wallet{
  constructor(){
    super(hashConnect, "HashPack Wallet", "https://www.hashpack.app/", hashIcon, 'HashPack Wallet Connect');
  }

  installed(): boolean {
    return !hashConnect.availableExtension
  }
}