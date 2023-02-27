import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Tab, TabList, TabPanel, Tabs } from './';

export default {
  component: Tabs,
  title: 'Building Blocks/Tabs',
};

const TemplateTabs: ComponentStory<typeof Tabs> = (args: any) => {
  return (
    <Tabs {...args}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab disabled>Tab 3</Tab>
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
  );
};

export const Default = TemplateTabs.bind({});
Default.args = {};
