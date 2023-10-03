import { ElixirVault } from 'src/state/pelixirVaults/types';

export interface RemoveDrawerProps {
  isOpen: boolean;
  vault?: ElixirVault;
  onClose: () => void;
}
