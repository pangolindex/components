import { AlertTriangle } from 'react-feather';
import styled from 'styled-components';

export const WarningWrapper = styled.div`
  border-radius: 20px;
  border: ${({ theme }) => `1px solid ${theme.error}`};
  background: rgba(248, 45, 58, 0.05);
  padding: 1rem;
  color: ${({ theme }) => theme.error};
  position: relative;
  @media screen and (max-width: 800px) {
    width: 80% !important;
    margin-left: 5%;
  }
`;

export const StyledWarningIcon = styled(AlertTriangle)`
  min-height: 20px;
  min-width: 20px;
  stroke: ${({ theme }) => theme.error};
`;

export const ConvertLink = styled.a`
  color: ${({ theme }) => theme.error};
  text-decoration: none;
`;

export const AutoColumn = styled.div`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: '4px';
`;
