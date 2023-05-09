import React, { useState } from 'react';
import { HelpCircle } from 'react-feather';

const BAD_SRCS: { [tokenAddress: string]: true } = {};

export interface LogoProps {
  srcs: string[];
  alt?: string;
  className?: string;
  style?: any;
}

const Logo = ({ srcs, alt, ...rest }: LogoProps) => {
  const [, refresh] = useState<number>(0);

  const src: string | undefined = srcs.find((srcVal) => !BAD_SRCS[srcVal]);

  if (src) {
    return (
      <img
        {...rest}
        alt={alt}
        src={src}
        onError={() => {
          BAD_SRCS[src] = true;
          refresh((i) => i + 1);
        }}
      />
    );
  }

  return <HelpCircle {...rest} />;
};

export default Logo;
