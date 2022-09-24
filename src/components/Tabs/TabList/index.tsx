import React from 'react';
import { TabList as ReactTabList, TabListProps } from 'react-tabs';

const TabList: React.FC<TabListProps> = (props: any) => {
  return <ReactTabList {...props} />;
};

export default TabList;
