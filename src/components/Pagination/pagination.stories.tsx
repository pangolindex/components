import { ComponentStory } from '@storybook/react';
import React from 'react';
import Pagination from '.';

export default {
  component: Pagination,
  title: 'Components/Pagination',
};

const PaginationWidget: ComponentStory<typeof Pagination> = (args: any) => (
  <div style={{ margin: 'auto' }}>
    <Pagination {...args} />
  </div>
);

/* eslint-disable @typescript-eslint/no-unused-vars */
export const Default = PaginationWidget.bind({});
Default.args = {
  pageCount: 10,
  onPageChange: (event: any) => {},
};
