export type PositionListProps = {
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
  handleSearch: (value: any) => void;
  onChangeSortBy: (value: string) => void;
  sortBy: string;
  searchQuery: string;
  doesNotPoolExist: boolean;
  isLoading: boolean;
  children?: React.ReactNode;
};

export enum SortingType {
  liquidity = 'liquidity',
  apr = 'apr',
}
