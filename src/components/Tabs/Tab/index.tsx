import React from 'react';
import { TabProps } from 'react-tabs';
import { STab } from '../styles';

const Tab: React.FC<TabProps> = (props: any) => {
  return <STab {...props} />;
};

export default Tab;
