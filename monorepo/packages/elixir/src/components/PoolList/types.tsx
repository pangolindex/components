export interface PoolListProps {
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

export enum SortingType {
  liquidity = 'liquidity',
  apr = 'apr',
}
