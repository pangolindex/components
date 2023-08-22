import React from 'react';
import { Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Layout from './layout';
import Swap from './pages/Swap';
import Sample from './pages/Sample';
import BridgeUI from './pages/Bridge';

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 0px;
  align-items: unset;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;
  min-height: 100vh;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px;
    padding-top:  0px; 
  `};

  z-index: 1;
`;

export default function App() {
  return (
    <AppWrapper>
      <BodyWrapper>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Swap />} />
            <Route path="swap" element={<Swap />} />
            <Route path="dashboard" element={<Sample />} />
            <Route path="bridge" element={<BridgeUI />} />

            <Route path="*" element={<Swap />} />
          </Route>
        </Routes>
      </BodyWrapper>
    </AppWrapper>
  );
}
