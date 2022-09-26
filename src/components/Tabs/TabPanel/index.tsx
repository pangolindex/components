import React from 'react';
import { TabPanelProps } from 'react-tabs';
import { STabPanel } from '../styles';

const TabPanel: React.FC<TabPanelProps> = (props: any) => {
  console.log('props: ', props);
  return <STabPanel {...props} />;
};

export default TabPanel;
