/* eslint-disable max-lines */
import React from 'react';

interface CflrLogoProps {
  size?: string;
}

const CflrLogo: React.FC<CflrLogoProps> = ({ size = '24px ' }) => {
  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 1920 1920"
      enableBackground="new 0 0 1920 1920"
    >
      <g transform="translate(0.000000,1000.000000) scale(0.100000,-0.100000)" fill="#ffe669" stroke="none"></g>
      <image
        id="image0"
        width="1920"
        height="1920"
        x="0"
        y="0"
        href=""
      />
    </svg>
  );
};

export default CflrLogo;
/* eslint-enable max-lines */
