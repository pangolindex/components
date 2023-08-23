import React from 'react';
import { Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Layout from './layout';
import Sample from './pages/Sample';
import SarStake from './pages/SarSingleStake';
import Swap from './pages/Swap';
import Pool from './pages/Pool';

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
            <Route index element={<Sample />} />
            <Route path="sar" element={<SarStake />} />
            <Route path="swap" element={<Swap />} />
            <Route path="pool" element={<Pool />} />
            <Route path="dashboard" element={<Sample />} />

            <Route path="*" element={<Swap />} />
          </Route>
        </Routes>
      </BodyWrapper>
    </AppWrapper>
  );
}
