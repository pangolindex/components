import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { Box } from '../';
import { Tab, TabList, TabPanel, Tabs } from './';
import 'react-tabs/style/react-tabs.css';

export default {
  component: Tabs,
  title: 'Components/Tabs',
};

const TemplateTabs: ComponentStory<typeof Tabs> = (args: any) => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Box width="100%">
      <Box maxWidth="400px">
        <Tabs {...args} selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>
          <TabPanel>
            <h2>Any content 1</h2>
          </TabPanel>
          <TabPanel>
            <h2>Any content 2</h2>
          </TabPanel>
          <TabPanel>
            <h2>Any content 3</h2>
          </TabPanel>
        </Tabs>
      </Box>
    </Box>
  );
};

export const Default = TemplateTabs.bind({});
Default.args = {};
