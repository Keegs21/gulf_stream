// src/const/customChain.ts

import { Chain } from 'wagmi/chains';

export const realChain: Chain = {
  id: 111188,
  name: 'Real Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'reETH',
  },
  rpcUrls: {
    default: {
      http: ['https://real.drpc.org'],
      webSocket: [], // Add if you have a WebSocket endpoint
    },
    public: {
      http: ['https://real.drpc.org'],
      webSocket: [], // Add if you have a WebSocket endpoint
    },
  },
  blockExplorers: {
    default: { name: 'Real Explorer', url: 'https://explorer.re.al/' },
  },
  contracts: {}, // Include if you have any predefined contracts like multicall3
  testnet: false, // Set to true if it's a testnet
};
