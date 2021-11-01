import styled from 'styled-components';

export const StepWrapper = styled('div')`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
`;

export const StepItem = styled.div<{
  active?: boolean;
  completed?: boolean;
  disabled?: boolean;
  progressDot?: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'none' : 'pointer')};

  @media (max-width: 768px) {
    font-size: 12px;
  }
  &:before {
    position: absolute;
    content: '';
    border-bottom: 2px solid #717171;
    width: 100%;
    top: ${({ progressDot }) => (progressDot ? '21px' : '15px')};
    left: -50%;
    z-index: 2;
  }
  &:after {
    position: absolute;
    content: '';
    border-bottom: 2px solid;
    border-bottom-color: ${({ completed }) => (completed ? '#fff' : '#717171')};
    width: 100%;
    top: ${({ progressDot }) => (progressDot ? '21px' : '15px')};
    left: 50%;
    z-index: ${({ completed }) => (completed ? 3 : 2)};
  }
  &:first-child:before {
    content: none;
  }
  &:last-child::after {
    content: none;
  }
`;

export const StepCounter = styled.div<{ completed?: boolean; active?: boolean }>`
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${({ completed, active }) => (completed || active ? '#fff' : '#717171')};
  color: ${({ completed, active }) => (completed || active ? '#111111' : '#fff')};
  margin-bottom: 6px;
`;

export const StepName = styled('div')`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  color: #fff;
`;

export const IconDot = styled.div<{ completed?: boolean; active?: boolean }>`
position: relative;
z-index: 5;
display: flex;
justify-content: center;
align-items: center;
width: 10px;
height: 10px;
border-radius: 50%;
background: ${({ completed, active }) => (completed || active ? '#fff' : '#717171')};
margin-top: 17px;
}
`;
