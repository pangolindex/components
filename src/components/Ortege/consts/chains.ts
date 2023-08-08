export declare type ChainMap<Value> = Record<string, Value>;

export type ChainMetadataWithArtifacts = {
  name: string;
  protocol: string;
  chainId: number;
  nativeToken?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  mailbox: string;
  interchainGasPaymaster: string;
  validatorAnnounce: string;
  rpcUrls: Array<{
    http: string;
  }>;
};

// A map of chain names to ChainMetadata
export const chains: ChainMap<ChainMetadataWithArtifacts> = {
  fantom: {
    name: 'fantom',
    protocol: 'ethereum',
    chainId: 4002,
    nativeToken: {
      name: 'fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    mailbox: '0x810C84f1F791e71FD806fABfcEb654e09dF9C43c',
    interchainGasPaymaster: '0x8390B08d33EfAc131be9F15D1252eE47C2A2236c',
    validatorAnnounce: '0x53e2696f3bdBCeB3C829BE888b2c83C32ce501EC',
    rpcUrls: [
      {
        http: 'https://rpc.testnet.fantom.network',
      },
    ],
  },

  fuji: {
    name: 'fuji',
    chainId: 43113,
    mailbox: '0xd2d73BC3542dfAFa763d543Fc2F5E2C0FA96B8CE',
    interchainGasPaymaster: '0xb75F8c884f2fed4A01dc0EFc615F972728B8AA42',
    validatorAnnounce: '0x35199777116a3A2727B73CD526C32fD869B2a4D6',
    protocol: 'ethereum',
    rpcUrls: [
      {
        http: 'https://api.avax-test.network/ext/bc/C/rpc',
      },
    ],
  },
};
