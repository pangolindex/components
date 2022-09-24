import React from 'react';
import { Tabs as ReactTabs, TabsProps } from 'react-tabs';

const Tabs: React.FC<TabsProps> = (props: any) => {
  return <ReactTabs {...props} />;
};

export default Tabs;
