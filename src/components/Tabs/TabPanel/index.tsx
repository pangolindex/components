import React from 'react';
import { TabPanelProps } from 'react-tabs';
import { STabPanel } from '../styles';

const TabPanel: React.FC<TabPanelProps> = (props: any) => {
  return <STabPanel {...props} />;
};

(TabPanel as any).tabsRole = 'TabPanel';

export default TabPanel;
