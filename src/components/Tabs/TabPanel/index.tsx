import React from 'react';
import { TabPanel as ReactTabPanel, TabPanelProps } from 'react-tabs';

const TabPanel: React.FC<TabPanelProps> = (props: any) => {
  return <ReactTabPanel {...props} />;
};

export default TabPanel;
