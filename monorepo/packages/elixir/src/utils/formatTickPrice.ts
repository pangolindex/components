import { NumberType, Price, formatPrice } from '@pangolindex/sdk';
import { Bound } from 'src/state/mint/atom';

export function formatTickPrice({
  price,
  atLimit,
  direction,
  placeholder,
  numberType,
}: {
  price: Price | undefined;
  atLimit: { [bound in Bound]?: boolean | undefined };
  direction: Bound;
  placeholder?: string;
  numberType?: NumberType;
}) {
  if (atLimit[direction]) {
    return direction === Bound.LOWER ? '0' : '∞';
  }

  if (!price && placeholder !== undefined) {
    return placeholder;
  }

  return formatPrice(price, numberType ?? NumberType.TokenNonTx);
}
