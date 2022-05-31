import { ComponentStory } from '@storybook/react';
import React from 'react';
import { NetworkSelection } from '.';

export default {
  component: NetworkSelection,
  title: 'Components/NetworkSelection',
};

const TemplateNetworkSelection: ComponentStory<typeof NetworkSelection> = (args: any) => <NetworkSelection {...args} />;

export const Network = TemplateNetworkSelection.bind({});
Network.args = {
  open: true,
};
