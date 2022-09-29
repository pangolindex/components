import React from 'react';
import ReactTooltip, { TooltipProps } from 'react-tooltip';

const Tooltip: React.FC<TooltipProps> = (props) => {
  return <ReactTooltip {...props} />;
};

export default Tooltip;
