import { default as ThemeProvider } from '@pangolindex/theme';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { theme } from './utils/theme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
