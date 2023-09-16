import { atom, useAtom } from 'jotai';
import { SUPPORTED_WALLETS } from 'src/wallet';

const walletsAtom = atom<typeof SUPPORTED_WALLETS>(SUPPORTED_WALLETS);

export function useWalletState() {
  const [wallets, setWallets] = useAtom(walletsAtom);

  return {
    wallets,
    setWallets,
  };
}
