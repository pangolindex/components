import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@honeycomb-finance/shared';

const InternalProvider = ({ children, theme }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export const decorators = [
  (Story, metadata) => {
    const theme = metadata.args.theme ?? undefined;
    return (
      <InternalProvider theme={theme}>
        <Story />
      </InternalProvider>
    );
  },
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
