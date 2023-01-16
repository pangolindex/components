import styled from 'styled-components';
import { Box } from 'src/components';

export const Transfer = styled.tr`
  background-color: ${({ theme }) => theme.bridge?.primaryBgColor};
  border-radius: 10px;
  padding: 30px;
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
  width: 100%
  justify-content: space-around;
`;

export const Data = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: 30px;
`;

export const ResumeLayout = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
`;

export const Buttons = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
`;
