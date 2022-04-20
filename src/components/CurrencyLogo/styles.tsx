import styled from 'styled-components';
import Logo from '../Logo';

export const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  /* box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075); */
`;
