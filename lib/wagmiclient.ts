// src/lib/wagmiClient.ts

import { createConfig, http } from 'wagmi';
import { realChain } from '@/const/customChain';


const wagmiClient = createConfig({
  chains: [realChain],
  transports: {
    [realChain.id]: http(),
  },
});

export default wagmiClient;
