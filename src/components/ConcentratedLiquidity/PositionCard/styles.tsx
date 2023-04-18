import styled from 'styled-components';
import { Box, Text } from 'src/components';

export const HoverWrapper = styled.div`
  --border-size: 5px;
  --c: ${({ theme }) => theme.color8}; /* the border color */
  --b: 3px; /* the border thickness*/
  --g: 2px; /* the gap on hover */
  --border-angle: 0turn;
  padding: calc(var(--g) + var(--b));
  width: 100%;
  /* background-image: conic-gradient(from var(--border-angle), #213, #112 50%, #213),
    conic-gradient(from var(--border-angle), transparent 20%, var(--c), var(--c)); */
  background-size: calc(100% - (var(--border-size) * 2)) calc(100% - (var(--border-size) * 2)), cover;
  background-position: center center;
  background-repeat: no-repeat;
  cursor: pointer;
  animation: bg-spin 6s linear infinite;
  animation-play-state: paused;
  @keyframes bg-spin {
    to {
      --border-angle: 1turn;
    }
  }
  @property --border-angle {
    syntax: '<angle>';
    inherits: true;
    initial-value: 0turn;
  }
  &:hover {
    transition-delay: 1s; /* delays for 1 second */
    -webkit-transition-delay: 1s; /* for Safari & Chrome */

    animation-play-state: running;
    --c: ${({ theme }) => theme.primary}; /* the border color */
  }
`;

export const Card = styled.div`
  background-color: ${({ theme }) => theme.concentratedLiquidity?.primaryBgColor};
  border-radius: 10px;
  padding: 32px;
  display: flex;
  flex-direction: row;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: space-between;
    width: max-content;
  `};
`;

export const Row = styled(Box)`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

export const BlackBox = styled(Box)`
  background-color: ${({ theme }) => theme.concentratedLiquidity?.secondaryBgColor};
  border-radius: 7px;
  display: flex;
  flex-direction: row;
`;

export const BlackBoxContent = styled(Text)`
  padding: 0.1rem 1rem;
`;

export const Data = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding-right: 30px;
`;

export const PriceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-gap: 15px;
  `};
`;

export const DesktopWrapper = styled(Box)`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`;

export const MobileWrapper = styled(Box)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: block;
  `};
`;

export const Panel = styled(Box)`
  background-color: ${({ theme }) => theme.concentratedLiquidity?.primaryBgColor};
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 20px;
  border-radius: 10px;
  * {
    box-sizing: border-box;
  }
`;

export const OptionButton = styled.div`
  font-weight: 500;
  width: fit-content;
  white-space: nowrap;
  padding: 2px 6px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.primary};
  font-size: 13px;
  color: ${({ theme }) => theme.black};
`;

export const OptionsWrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: auto auto;
  grid-gap: 10px;
`;
