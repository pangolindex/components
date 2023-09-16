import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { AppContent, MainContent, Wrapper } from './styled';

const Layout: React.FC<unknown> = () => {
  return (
    <Wrapper>
      <MainContent>
        <Header />
        <AppContent>
          <Outlet />
        </AppContent>
      </MainContent>
    </Wrapper>
  );
};

export default Layout;
