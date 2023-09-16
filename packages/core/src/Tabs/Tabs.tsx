import React from 'react';
import { TabsProps } from 'react-tabs';
import { STabs } from './styles';

const Tabs: React.FC<TabsProps> = (props: any) => {
  return <STabs selectedTabClassName="is-selected" selectedTabPanelClassName="is-selected" {...props} />;
};

export default Tabs;
