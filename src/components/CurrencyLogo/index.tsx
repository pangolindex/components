import { Currency, Token } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { LogoSize } from 'src/constants';
import { useChainId } from 'src/hooks';
import { getTokenLogoURL } from 'src/utils/getTokenLogoURL';
import { StyledLogo } from './styles';

export default function CurrencyLogo({
  currency,
  size = 24,
  style,
  className,
  imageSize = size,
}: {
  currency?: Currency;
  size?: LogoSize;
  style?: React.CSSProperties;
  imageSize?: LogoSize;
  className?: string;
}) {
  const chainId = useChainId();

  const srcs: string[] = useMemo(() => {
    const primarySrc = getTokenLogoURL((currency as Token)?.address, chainId, imageSize);

    return [primarySrc];
  }, [currency]);

  return (
    <StyledLogo
      className={className}
      size={`${size}px`}
      srcs={srcs}
      alt={`${currency?.symbol ?? 'token'} logo`}
      style={style}
    />
  );
}
