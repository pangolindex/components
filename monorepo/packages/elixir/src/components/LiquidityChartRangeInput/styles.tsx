import { Button } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const ChartWrapper = styled.div`
  position: relative;

  justify-content: center;
  align-content: center;
`;

export const StyledLine = styled.line`
  opacity: 0.5;
  stroke-width: 2;
  stroke: ${({ theme }) => theme?.liquidityChartRangeInput?.styledLine};
  fill: none;
`;

export const Handle = styled.path<{ color: string }>`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 3;
  stroke: ${({ color }) => color};
  fill: ${({ color }) => color};
`;

export const HandleAccent = styled.path`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 1.5;
  stroke: ${({ theme }) => theme?.liquidityChartRangeInput?.handleAccentColor};
`;

export const LabelGroup = styled.g<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? '1' : '0')};
  transition: opacity 300ms;
`;

export const TooltipBackground = styled.rect`
  fill: ${({ theme }) => theme?.liquidityChartRangeInput?.tooltipBackground};
`;

export const Tooltip = styled.text`
  text-anchor: middle;
  font-size: 13px;
  fill: ${({ theme }) => theme?.liquidityChartRangeInput?.tooltipText};
`;

export const StyledGroup = styled.g`
  line {
    display: none;
  }

  text {
    color: ${({ theme }) => theme.text2};
    transform: translateY(5px);
  }
`;

export const Path = styled.path<{ fill: string | undefined }>`
  opacity: 0.5;
  stroke: ${({ fill, theme }) => fill ?? theme?.liquidityChartRangeInput?.pathColor};
  fill: ${({ fill, theme }) => fill ?? theme?.liquidityChartRangeInput?.pathColor};
`;

export const ZoomWrapper = styled.div<{ count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ count }) => count.toString()}, 1fr);
  grid-gap: 6px;

  position: absolute;
  top: -28px;
  right: 0;
`;

export const CustomButton = styled(Button)`
  &:hover {
    box-shadow: inset 0 0 100px 100px ${({ theme }) => theme.white}4C;
  }
  color: ${({ theme }) => theme.color11};
  background-color: ${({ theme }) => theme?.liquidityChartRangeInput?.bgColor};
  width: 32px;
  height: 32px;
  padding: 4px;
`;

export const ZoomOverlay = styled.rect`
  fill: transparent;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;
