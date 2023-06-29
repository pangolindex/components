import React from 'react';
import { ChainId, SONGBIRD_CANARY, FLARE_MAINNET, HEDERA_MAINNET } from '@pangolindex/sdk';
import { PNG } from '@components/constants/tokens';
import { getTokenLogoURL } from '@components/utils/getTokenLogoURL';
import { Frame } from './styleds';
import { Airdrop, ClosedRegistration, ComingSoon } from '@components/components';

const activeAirdrops = [
  {
    contractAddress: SONGBIRD_CANARY!.contracts!.airdrop!.address,
    type: SONGBIRD_CANARY!.contracts!.airdrop!.type,
    token: PNG[ChainId.SONGBIRD],
    logo: getTokenLogoURL(PNG[ChainId.SONGBIRD].address, ChainId.SONGBIRD, 48),
  },
  {
    contractAddress: FLARE_MAINNET!.contracts!.airdrop!.address,
    type: FLARE_MAINNET!.contracts!.airdrop!.type,
    token: PNG[ChainId.FLARE_MAINNET],
    logo: getTokenLogoURL(PNG[ChainId.FLARE_MAINNET].address, ChainId.FLARE_MAINNET, 48),
  },
  {
    contractAddress: HEDERA_MAINNET!.contracts!.airdrop!.address,
    type: HEDERA_MAINNET!.contracts!.airdrop!.type,
    token: PNG[ChainId.HEDERA_MAINNET],
    logo: getTokenLogoURL(PNG[ChainId.HEDERA_MAINNET].address, ChainId.HEDERA_MAINNET, 48),
  },
];

const specialAirdrops = [
  {
    contractAddress: SONGBIRD_CANARY!.contracts!.specialAirdrops![0]!.address,
    type: SONGBIRD_CANARY!.contracts!.specialAirdrops![0]!.type,
    title: SONGBIRD_CANARY!.contracts!.specialAirdrops![0]!.title,
    token: PNG[ChainId.SONGBIRD],
    logo: getTokenLogoURL(PNG[ChainId.SONGBIRD].address, ChainId.SONGBIRD, 48),
  },
];

const ComingSoonAirdrops = [
  {
    token: PNG[ChainId.WAGMI],
    logo: getTokenLogoURL(PNG[ChainId.WAGMI].address, ChainId.WAGMI, 48),
  },
];

export default function AirdropUI() {
  return (
    <Frame>
      {activeAirdrops.map((airdrop, index) => (
        <Airdrop {...airdrop} key={`${index}-${airdrop.contractAddress}`} />
      ))}
      {specialAirdrops.map((airdrop, index) => (
        <Airdrop {...airdrop} key={`${index}-${airdrop.contractAddress}`} />
      ))}
      {ComingSoonAirdrops.map((airdrop, index) => (
        <ComingSoon {...airdrop} key={`${index}-${airdrop.token.address}`} />
      ))}
      <ClosedRegistration
        token={PNG[ChainId.HEDERA_TESTNET]}
        logo={getTokenLogoURL(PNG[ChainId.HEDERA_TESTNET].address, ChainId.HEDERA_TESTNET, 48)}
      />
    </Frame>
  );
}
