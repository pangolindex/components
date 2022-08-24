import { ComponentStory } from '@storybook/react';
import React from 'react';
import SarNFTPortfolio from '.';

export default {
  component: SarNFTPortfolio,
  title: 'Components/SarPortfolio',
};

const TemplateSarPortfilio: ComponentStory<typeof SarNFTPortfolio> = (args: any) => <SarNFTPortfolio {...args} />;

/* eslint-disable @typescript-eslint/no-unused-vars */
export const Default = TemplateSarPortfilio.bind({});
Default.args = {
  onSelectPosition: (position: any) => {},
};
