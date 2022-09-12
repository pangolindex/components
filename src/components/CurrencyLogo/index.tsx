import { CAVAX, ChainId, Currency, Token } from '@pangolindex/sdk';
import deepEqual from 'deep-equal';
import React, { useMemo } from 'react';
import NearLogo from 'src/assets/images/near.svg';
import SongBirdLogo from 'src/assets/images/songbird.png';
import WgmiLogo from 'src/assets/images/wagmi.png';
import { AvaxLogo, CflrLogo } from 'src/components/Icons';
import { LogoSize } from 'src/constants';
import { useChainId } from 'src/hooks';
import { getTokenLogoURL } from 'src/utils/getTokenLogoURL';
import { StyledLogo } from './styles';

export default function CurrencyLogo({
  currency,
  size = 24,
  style,
  imageSize = size,
}: {
  currency?: Currency;
  size?: LogoSize;
  style?: React.CSSProperties;
  imageSize?: LogoSize;
}) {
  const chainId = useChainId();

  const srcs: string[] = useMemo(() => {
    if (
      currency === CAVAX[ChainId.AVALANCHE] ||
      currency === CAVAX[ChainId.WAGMI] ||
      currency === CAVAX[ChainId.COSTON] ||
      currency === CAVAX[ChainId.SONGBIRD] ||
      currency === CAVAX[ChainId.NEAR_TESTNET] ||
      currency === CAVAX[ChainId.NEAR_MAINNET]
    )
      return [];
    if (currency instanceof Token || !!(currency as Token).address) {
      const primarySrc = getTokenLogoURL((currency as Token)?.address, chainId, imageSize);

      return [primarySrc];
    }

    return [];
  }, [currency]);

  if (deepEqual(currency, CAVAX[ChainId.AVALANCHE])) {
    return <AvaxLogo size={`${size}px`} />;
  } else if (deepEqual(currency, CAVAX[ChainId.WAGMI])) {
    return <img src={WgmiLogo} width={`${size}px`} height={`${size}px`} />;
  } else if (deepEqual(currency, CAVAX[ChainId.COSTON])) {
    return <CflrLogo size={`${size}px`} />;
  } else if (deepEqual(currency, CAVAX[ChainId.NEAR_TESTNET]) || deepEqual(currency, CAVAX[ChainId.NEAR_MAINNET])) {
    return <img src={NearLogo} width={`${size}px`} height={`${size}px`} />;
  } else if (deepEqual(currency, CAVAX[ChainId.SONGBIRD])) {
    return <img src={SongBirdLogo} width={`${size}px`} height={`${size}px`} />;
  }

  return <StyledLogo size={`${size}px`} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />;
}
