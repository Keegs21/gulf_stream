// src/const/contracts.ts

import client from "@/lib/client";
import { defineChain, getContract } from "thirdweb";
import veNFTAPIAbi from "@/abis/VENFTABI.json"; // Ensure the path is correct

export const VENFT_API_ABI = veNFTAPIAbi;

// Define your custom chain
const chain = defineChain({
  id: 111188,
  rpc: "https://real.drpc.org",
  nativeCurrency: {
    name: "Ether",
    symbol: "reETH",
    decimals: 18,
  },
});
export const NETWORK = chain;

// Addresses of your smart contracts
export const MARKETPLACE_ADDRESS = "0x90612F84Bc2CdC266038b35751806619DE3AAfA7";
export const NFT_COLLECTION_ADDRESS = "0x99E35808207986593531D3D54D898978dB4E5B04";
export const VENFT_API_ADDRESS = "0xbFD5D43671F6AADa2123FaeD83e9B8d1EddAB8cA";

// Initialize your contracts
export const MARKETPLACE = getContract({
  address: MARKETPLACE_ADDRESS,
  client,
  chain: NETWORK,
});

export const NFT_COLLECTION = getContract({
  address: NFT_COLLECTION_ADDRESS,
  client,
  chain: NETWORK,
});

export const VENFT_API = getContract({
  address: VENFT_API_ADDRESS,
  client,
  chain: NETWORK,
});

// (Optional) Set up the URL of where users can view transactions
export const ETHERSCAN_URL = "https://explorer.re.al/";
