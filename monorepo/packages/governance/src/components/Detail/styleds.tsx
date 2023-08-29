import { AutoColumn, Box } from '@pangolindex/core';
import styled from 'styled-components';

export const PageWrapper = styled(AutoColumn)`
  width: 100%;
`;

export const ProposalInfo = styled(AutoColumn)`
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  max-width: 960px;
  width: 100%;
`;

export const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-weight: 500;

  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`;

export const ArrowWrapper = styled(StyledLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  color: ${({ theme }) => theme.text1};
  a {
    color: ${({ theme }) => theme.text1};
    text-decoration: none;
  }
  :hover {
    text-decoration: none;
  }
`;

export const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `};
`;

export const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #f97316 0%, #e84142 100%);
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

export const StyledDataCard = styled(DataCard)`
  width: 100%;
  background: none;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text1};
  height: fit-content;
  z-index: 2;
  display: block;
`;

export const ProgressWrapper = styled.div`
  width: 100%;
  margin-top: 1rem;
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg3};
  position: relative;
`;

export const Progress = styled.div<{ status: 'for' | 'against'; percentageString?: string }>`
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme, status }) => (status === 'for' ? theme.success : theme.venetianRed)};
  width: ${({ percentageString }) => percentageString};
`;

export const MarkDownWrapper = styled.div`
  max-width: 640px;
  overflow: hidden;
`;

export const WrapSmall = styled(Box)`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: 'center';
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-start;
    flex-direction: column;
  `};
`;

export const DetailText = styled.div`
  word-break: break-all;
`;

const handleColorType = (status?: any, theme?: any) => {
  switch (status) {
    case 'pending':
      return theme.blue1;
    case 'active':
      return theme.blue1;
    case 'succeeded':
      return theme.green1;
    case 'defeated':
      return theme.red1;
    case 'queued':
      return theme.text3;
    case 'executed':
      return theme.green1;
    case 'canceled':
      return theme.text3;
    case 'expired':
      return theme.text3;
    default:
      return theme.text3;
  }
};

export const ProposalStatus = styled.span<{ status: string }>`
  font-size: 0.825rem;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 8px;
  color: ${({ status, theme }) => handleColorType(status, theme)};
  border: 1px solid ${({ status, theme }) => handleColorType(status, theme)};
  width: fit-content;
  justify-self: flex-end;
  text-transform: uppercase;
`;

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1rem;
  z-index: 1;
  opacity: ${({ disabled }) => disabled && '0.4'};
`;

export const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`;

export const ButtonWrapper = styled(Box)`
  width: fit-content;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`;
