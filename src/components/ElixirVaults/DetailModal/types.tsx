import { ElixirVault } from 'src/state/pelixirVaults/types';

export type DetailModalProps = {
  isOpen: boolean;
  vault?: ElixirVault;
  onClose: () => void;
};
