import { ElixirVault } from 'src/state/pelixirVaults/types';
import { DoubleSideStakingInfo } from 'src/state/pstake/types';

export interface RemoveDrawerProps {
  isOpen: boolean;
  vault?: ElixirVault;
  stakingInfo?: DoubleSideStakingInfo;
  onClose: () => void;
}
