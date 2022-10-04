import React from 'react';
import useCollapse from 'react-collapsed';
import { Root } from './styles';
import { CollapsedProps } from './types';

const Collapsed: React.FC<CollapsedProps> = (props) => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
  return (
    <Root>
      <div {...getToggleProps()}>{isExpanded ? props.collapse || 'Collapse' : props.expand || 'Expand'}</div>
      <section {...getCollapseProps()}>{props.children}</section>
    </Root>
  );
};

export default Collapsed;
