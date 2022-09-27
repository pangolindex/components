import React from 'react';
import { TabProps } from 'react-tabs';
import { STab } from '../styles';

const Tab: React.FC<TabProps> = (props: any) => {
  return <STab {...props} />;
};

(Tab as any).tabsRole = 'Tab';

export default Tab;
