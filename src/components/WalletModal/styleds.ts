import styled from "styled-components";
import { Box, Button, Logo } from 'src/components'

export const Wrapper = styled(Box)`
  display: grid;
  gap: 20px;
  padding: 20px;
  background-color: ${({ theme }) => theme.color2};
  border-radius: 10px;
  position: relative;
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
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
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
  height: 40px;
  width: 40px;
`;

export const ChainButton = styled(Button)`
  width: 68px;
`

export const Bookmark = styled(Box)`
  background-color: ${({theme}) => theme.primary};
  border-radius: 0px 4px 4px 0px;
  height: 50%;
  width: 5px;
  position: absolute;
  left: 0px;
`

export const WalletButton = styled(Button)`
  display: grid;
  justify-items: center;
  align-content: baseline;
  min-height: 90px;
  gap: 5px;
  background-color: ${({ theme }) => theme.color3};
  border-radius: 8px;
  padding: 10px;
  position: relative;
`

export const GreenCircle = styled.div`
  height: 8px;
  width: 8px;
  background-color: ${({ theme }) => theme.green1};
  border-radius: 50%;
  position: absolute;
  top: 5px;
  left: 5px;
`;