export type SidebarProps = {
  setMenu: (value: string) => void;
  changeAddLiquidityModalStatus: () => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
};

export enum MenuType {
  topPools = 'topPools',
  allPositions = 'allPositions',
  openPositions = 'openPositions',
  closedPositions = 'closedPositions',
  elixirVaults = 'elixirVaults',
}
