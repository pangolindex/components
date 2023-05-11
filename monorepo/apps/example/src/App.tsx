import { Button, NewsWidget } from '@pangolindex/core';
import React from 'react';
import './App.css';

function App() {
  return (
    <>
      <NewsWidget />
      <Button type="button" variant="primary" loading={true}>
        Test
      </Button>
    </>
  );
}

export default App;
