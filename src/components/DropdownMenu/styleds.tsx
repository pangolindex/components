import styled from 'styled-components';

export const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`;

export const StyledMenuButton = styled.div<{ height?: string }>`
  position: relative;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.color6};
  background: ${({ theme }) => theme.color5};
  margin: 0;
  height: ${({ height }) => (height ? height : '35px')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  border: none;
  min-width: 120px;
  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.color5};
  }
`;

export const MenuFlyout = styled.span`
  min-width: 20.125rem;
  background-color: ${({ theme }) => theme.bg2};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 4rem;
  right: 0rem;
  z-index: 100;
`;

export const NarrowMenuFlyout = styled(MenuFlyout)`
  min-width: 8.125rem;
  width: 100%;
  top: 3rem;
  background-color: ${({ theme }) => theme.color5};
  border-radius: 8px;
  box-shadow: ${({
    theme,
  }) => `0px 0px 1px ${theme.advancedBG}, 0px 4px 8px ${theme.advancedBG}, 0px 16px 24px ${theme.advancedBG},
    0px 24px 32px ${theme.advancedBG}`};

  div {
    color: ${({ theme }) => theme.color6};
    margin-left: 12px;
  }
`;
export const MenuLink = styled.div`
  cursor: pointer;
  font-size: 14px;
  padding: 4px 0px;
`;
