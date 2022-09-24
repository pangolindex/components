import React from 'react';
import { Tab as ReactTab, TabProps } from 'react-tabs';

const Tab: React.FC<TabProps> = (props: any) => {
  return <ReactTab {...props} />;
};

export default Tab;
