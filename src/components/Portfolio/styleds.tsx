import styled from 'styled-components';
import { Box } from '../Box';

export const PortifolioRoot = styled(Box)`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;

  padding: 20px;

  border-radius: 10px;
  background-color: ${({ theme }) => theme.color2};
`;

export const PortfolioHeader = styled(Box)`
  width: 100%;
  display: flex;
  gap: 5px;
`;

export const PortifolioFooter = styled(PortfolioHeader)`
  background-color: ${({ theme }) => theme.bg6};
  color: ${({ theme }) => theme.text13};
  border-radius: 4px;

  justify-content: center;
  align-items: center;
  gap: 5px;

  padding: 5px;
`;

export const HideButton = styled.button`
  background-color: ${({ theme }) => theme.bg6};
  color: ${({ theme }) => theme.text15};

  font-size: 12px;
  border-radius: 5px;
  border: 0px;
  padding: 5px;

  display: flex;
  align-items: center;

  cursor: pointer;

  :hover,
  :focus {
    opacity: 0.8;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    #portfolio-text {
      display: none;
    }
  `}
`;

export const ChainCard = styled(Box)`
  padding: 10px;
  background-color: ${({ theme }) => theme.bg6};
  border-radius: 8px;
  display: flex;
  flex-direction: row;

  justify-content: center;
  align-items: center;

  gap: 10px;

  font-weight: 500;
  width: 100%;
`;

export const Frame = styled(Box)`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;

  gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1fr 1fr 1fr !important;
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr 1fr !important;
  `}
`;
