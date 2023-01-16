import styled from "styled-components";
import { Box, Logo } from 'src/components'

export const Wrapper = styled(Box)`
  display: grid;
  gap: 20px;
  padding: 20px;
  background-color: ${({ theme }) => theme.color2};
  border-radius: 10px;
`

export const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const Inputs = styled(Box)`
  display: grid;
  grid-auto-flow: column;
  gap: 20px;
`;

export const ChainFrame = styled(Box)`
  display: grid;
  gap: 10px;
`
export const WalletFrame = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
  gap: 10px;
  width: 100%;
`

export const Separator = styled.hr`
  width: 0px;
  height: 100%;
  border: 1px solid #393939;
  border-radius: 2px;
  margin-left: 10px;
  margin-right: 10px;
`

export const StyledLogo = styled(Logo)`
  height: 48px;
  width: 48px;
  border-radius: 50%;
`;
