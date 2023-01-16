import styled from 'styled-components';
import { LogoSize } from 'src/constants';
import Logo from '../Logo';

export const StyledLogo = styled(Logo)<{ size: LogoSize }>`
  width: ${({ size }) => size.toString() + 'px'};
  height: ${({ size }) => size.toString() + 'px'};
  border-radius: ${({ size }) => size.toString() + 'px'};
  /* box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075); */
`;

export const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`;

export const HigherLogo = styled(StyledLogo)<{ size: LogoSize }>`
  z-index: 2;
`;

export const CoveredLogo = styled(StyledLogo)<{ sizeraw: number; size: LogoSize }>`
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`;
