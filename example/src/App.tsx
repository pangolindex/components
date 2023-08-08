import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Layout from './layout';
import Swap from './pages/Swap';
import Pool from './pages/Pool';
import Bridge from './pages/Bridge';
import SarStake from './pages/SarSingleStake';
import ElixirUI from './pages/Elixir';
import Governance from './pages/Governance';
import GovernanceDetailV2 from './pages/GovernanceDetail';
import AirdropUI from './pages/Airdrop';
import OrtegeUI from './pages/Ortege';

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
            <Route path="pool" element={<Pool />} />
            <Route path="elixir" element={<ElixirUI />} />
            <Route path="bridge" element={<Bridge />} />
            <Route path="ortege" element={<OrtegeUI />} />
            <Route path="sar" element={<SarStake />} />
            <Route path="vote" element={<Governance />} />
            <Route path="vote/:id" element={<GovernanceDetailV2 />} />
            <Route path="airdrop" element={<AirdropUI />} />
            <Route path="*" element={<Swap />} />
          </Route>
        </Routes>
      </BodyWrapper>
    </AppWrapper>
  );
}
