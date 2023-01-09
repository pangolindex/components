import React from 'react';
import Header from './Header';
import { Wrapper, MainContent, AppContent } from './styled';
import { Outlet } from 'react-router-dom';

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
