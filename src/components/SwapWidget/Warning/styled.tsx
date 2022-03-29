import { AlertTriangle } from 'react-feather';
import styled from 'styled-components';

export const WarningWrapper = styled.div`
  border-radius: 20px;
  border: 1px solid #f82d3a;
  background: rgba(248, 45, 58, 0.05);
  padding: 1rem;
  color: #f82d3a;
  position: relative;
  @media screen and (max-width: 800px) {
    width: 80% !important;
    margin-left: 5%;
  }
`;

export const StyledWarningIcon = styled(AlertTriangle)`
  min-height: 20px;
  min-width: 20px;
  stroke: red;
`;

export const ConvertLink = styled.a`
  color: #ed147a;
  text-decoration: none;
`;

export const AutoColumn = styled.div`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: '4px';
`;
