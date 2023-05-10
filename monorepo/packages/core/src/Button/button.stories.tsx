import { ComponentStory } from '@storybook/react';
import React from 'react';
import { CheckCircle } from 'react-feather';
import { Button } from '.';

export default {
  component: Button,
  title: 'Building Blocks/Buttons',
};

const TemplateButton: ComponentStory<typeof Button> = (args: any) => <Button {...args}>Button</Button>;

export const Primary = TemplateButton.bind({});
Primary.args = {
  variant: 'primary',
  loading: false,
  loadingText: 'Loading',
};

export const AfterIcon = TemplateButton.bind({});
AfterIcon.args = {
  variant: 'primary',
  iconAfter: <CheckCircle size={'12'} color="black" />,
};

export const BeforeIcon = TemplateButton.bind({});
BeforeIcon.args = {
  variant: 'primary',
  iconBefore: <CheckCircle size={'14'} color="black" />,
};

const TemplateIconButton: ComponentStory<typeof Button> = (args: any) => (
  <Button {...args}>
    <CheckCircle size={'16'} />
  </Button>
);

export const IconButton = TemplateIconButton.bind({});
IconButton.args = {
  variant: 'primary',
  width: '50px',
};

export const LinkButton = TemplateButton.bind({});
LinkButton.args = {
  variant: 'primary',
  as: 'a',
  href: 'https://pangolin.exchange/',
};
