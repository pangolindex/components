export type SidebarProps = {
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
};

export enum MenuType {
  allPositions = 'allPositions',
  openPositions = 'openPositions',
  closedPositions = 'closedPositions',
}
