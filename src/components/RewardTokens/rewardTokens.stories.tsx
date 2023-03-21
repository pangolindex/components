import { ComponentStory } from '@storybook/react';
import React from 'react';
import RewardTokens from '.';

export default {
  component: RewardTokens,
  title: 'Building Blocks/RewardTokens',
};

const TemplateRewardTokens: ComponentStory<typeof RewardTokens> = () => {
  return (
    <div>
      <RewardTokens />
    </div>
  );
};

export const Default = TemplateRewardTokens.bind({});
