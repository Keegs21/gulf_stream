// src/const/contracts.ts

import client from "@/lib/client";
import { defineChain, getContract } from "thirdweb";
import veNFTAPIAbi from "@/abis/VENFTABI.json"; // Ensure the path is correct

export const VENFT_API_ABI = veNFTAPIAbi;

// Define your custom chain
const chain = defineChain({
  id: 111188,
  rpc: "https://111188.rpc.thirdweb.com/4a4edc92332d34cf43139040e19cd31e",
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
export const PEARL_ADDRESS = "0xCE1581d7b4bA40176f0e219b2CaC30088Ad50C7A";
export const REETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const RWA_ADDRESS = "0x4644066f535ead0cde82d209df78d94572fcbf14";
export const VERWA_ADDRESS = "0x42EfcE5C2DcCFD45aA441D9e57D8331382ee3725";
export const RWALISTING_ADDRESS = "0xa7B4E29BdFf073641991b44B283FD77be9D7c0F4"; 


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

export const PEARL = getContract({
	  address: PEARL_ADDRESS,
  client,
  chain: NETWORK,
});

export const REETH = getContract({
  address: REETH_ADDRESS,
  client,
  chain: NETWORK,
});

export const RWA = getContract({
  address: RWA_ADDRESS,
  client,
  chain: NETWORK,
});

export const VERWA = getContract({
  address: VERWA_ADDRESS,
  client,
  chain: NETWORK,
});

export const RWA_LISTING = getContract({
  address: RWALISTING_ADDRESS,
  client,
  chain: NETWORK,
});

// (Optional) Set up the URL of where users can view transactions
export const ETHERSCAN_URL = "https://explorer.re.al/";
