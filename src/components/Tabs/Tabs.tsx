import React from 'react';
import { TabsProps } from 'react-tabs';
import { STabs } from './styles';

const Tabs: React.FC<TabsProps> = (props: any) => {
  return <STabs {...props} />;
};

export default Tabs;
