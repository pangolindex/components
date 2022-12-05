import styled from 'styled-components';
import { CloseIcon } from 'src/theme/components';
import { Box } from '../Box';

export const CloseButton = styled(CloseIcon)`
  color: ${({ theme }) => theme.text1};
  position: relative;
  right: -3px;
  top: 3px;
`;

export const Wrapper = styled.div<{ background?: string }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  max-width: 422px;
  border-radius: 10px;
  background-color: ${({ theme, background }) => (background ? background : theme.bg2)};
  ${({ theme }) => theme.mediaWidth.upToMedium`max-width: 100%`};
`;

export const ModalWrapper = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0rem 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0rem 1rem`};
`;

export const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 0rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color4};
`;

export const ContentWrapper = styled.div`
  padding: 0 2rem 2rem 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0 1rem 1rem 1rem`};
  width: 380px;
`;

export const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

export const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`;

export const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`;
