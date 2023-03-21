import { Currency } from '@pangolindex/sdk';
import { StatItemProps } from '../types';

export type HeaderProps = {
  currency0: Currency;
  currency1: Currency;
  statItems: StatItemProps[];
  onClose: () => void;
};
