export interface Props {
  padding?: string | number;
  backgroundColor?: string;
  borderRadius?: string | number;
  color?: string;
}

export interface ComponentProps extends Props {
  size?: string | number;
  onClick?: () => void;
}
