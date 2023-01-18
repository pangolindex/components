import { CAVAX, ChainId, Currency, Token } from '@pangolindex/sdk';
import deepEqual from 'deep-equal';
import React, { useMemo } from 'react';
import EvmosLogo from 'src/assets/images/evmos.svg';
import FlareLogo from 'src/assets/images/flare.svg';
import HederaLogo from 'src/assets/images/hedera.svg';
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
    if (
      currency === CAVAX[ChainId.AVALANCHE] ||
      currency === CAVAX[ChainId.WAGMI] ||
      currency === CAVAX[ChainId.COSTON] ||
      currency === CAVAX[ChainId.SONGBIRD] ||
      currency === CAVAX[ChainId.FLARE_MAINNET] ||
      currency === CAVAX[ChainId.HEDERA_TESTNET] ||
      currency === CAVAX[ChainId.NEAR_TESTNET] ||
      currency === CAVAX[ChainId.NEAR_MAINNET] ||
      currency === CAVAX[ChainId.COSTON2] ||
      currency === CAVAX[ChainId.EVMOS_TESTNET]
    )
      return [];
    if (currency instanceof Token || !!(currency as Token).address) {
      const primarySrc = getTokenLogoURL((currency as Token)?.address, chainId, imageSize);

      return [primarySrc];
    }

    return [];
  }, [currency]);

  if (deepEqual(currency, CAVAX[ChainId.AVALANCHE])) {
    return <AvaxLogo size={`${size}px`} className={className} />;
  } else if (deepEqual(currency, CAVAX[ChainId.WAGMI])) {
    return <img src={WgmiLogo} width={`${size}px`} height={`${size}px`} className={className} />;
  } else if (deepEqual(currency, CAVAX[ChainId.COSTON])) {
    return <CflrLogo size={`${size}px`} className={className} />;
  } else if (deepEqual(currency, CAVAX[ChainId.NEAR_TESTNET]) || deepEqual(currency, CAVAX[ChainId.NEAR_MAINNET])) {
    return <img src={NearLogo} width={`${size}px`} height={`${size}px`} className={className} />;
  } else if (deepEqual(currency, CAVAX[ChainId.SONGBIRD])) {
    return <img src={SongBirdLogo} width={`${size}px`} height={`${size}px`} className={className} />;
  } else if (deepEqual(currency, CAVAX[ChainId.FLARE_MAINNET])) {
    return <img src={FlareLogo} width={`${size}px`} height={`${size}px`} className={className} />;
  } else if (deepEqual(currency, CAVAX[ChainId.HEDERA_TESTNET])) {
    return <img src={HederaLogo} width={`${size}px`} height={`${size}px`} className={className} />;
  } else if (deepEqual(currency, CAVAX[ChainId.COSTON2])) {
    return <CflrLogo size={`${size}px`} className={className} />;
  } else if (deepEqual(currency, CAVAX[ChainId.EVMOS_TESTNET])) {
    return <img src={EvmosLogo} width={`${size}px`} height={`${size}px`} className={className} />;
  }
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
