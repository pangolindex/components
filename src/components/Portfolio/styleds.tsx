import styled from 'styled-components';
import { Box } from '../Box';

export const PortfolioRoot = styled(Box)`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
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
  flex-direction: row;
  gap: 5px;
`;

export const HideButton = styled.button`
  background-color: ${({ theme }) => theme.bg6};
  color: ${({ theme }) => theme.text15};

  min-width: 20px;
  min-height: 20px;

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

  align-self: flex-start;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    #portfolio-text {
      display: none;
    }
  `}
`;

export const ChainCard = styled(Box)`
  height: 80px;
  padding: 10px;
  background-color: ${({ theme }) => theme.bg6};
  border-radius: 4px;
  display: flex;
  flex-direction: row;

  justify-content: center;
  align-items: center;

  gap: 10px;

  font-weight: 500;
`;

export const Frame = styled(Box)`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
`;
