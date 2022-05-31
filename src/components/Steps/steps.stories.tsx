import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import Steps, { Step } from '.';

export default {
  component: Steps,
  title: 'Components/Steps',
  args: {
    index: 0,
  },
};

const TemplateSimpleStep: ComponentStory<typeof Steps> = () => {
  const [index, setIndex] = useState<number>(0);

  const handleChange = (step: number) => setIndex(step);
  return (
    <div style={{ background: '#000', padding: 50 }}>
      <Steps onChange={handleChange} current={index}>
        <Step title="Choose" />
        <Step title="Unstack" />
        <Step title="Remove" />
        <Step title="Add" />
        <Step title="Stack" />
      </Steps>
    </div>
  );
};

export const Simple = TemplateSimpleStep.bind({});

const TemplateProgressDotStep: ComponentStory<typeof Steps> = () => {
  const [index, setIndex] = useState<number>(-1);

  const handleChange = (step: number) => setIndex(step);
  return (
    <div style={{ background: '#000', padding: 50 }}>
      <Steps onChange={handleChange} current={index} progressDot={true}>
        <Step />
        <Step />
        <Step />
      </Steps>
    </div>
  );
};

export const ProgressDot = TemplateProgressDotStep.bind({});
