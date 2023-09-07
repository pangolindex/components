export interface ElixirVaultProps {
  setMenu?: (value: string) => void;
  activeMenu?: string;
  menuItems?: Array<{ label: string; value: string }>;
}
