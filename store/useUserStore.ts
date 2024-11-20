//@ts-nocheck
import { create } from 'zustand';
import { NFT } from 'thirdweb';

export interface NFTWithAssignedValue extends NFT {
  tokenId: string;          // Added tokenId as a string
  lockedTokenAmount: number;
  assignedValue: number;
  amount: string;           // Amount from vote contract
  contractAddress: string;  // Added contractAddress for uniqueness
}

export interface VoteData {
  tokenSymbol: string;
  tokenDecimals: number;
  voting_amount: string;
  voted: boolean;
  venft: Array<{
    id: number;
    amount: string;
    rebase_amount: string;
    lockEnd: number;
    vote_ts: number;
    account: string;
    token: string;
  }>;
  votes: Array<{
    pair: string;
    weight: string;
  }>;
}

// **New Interface for VERWA Vote Data**
export interface VoteDataVerwa {
  tokenSymbol: string;
  tokenDecimals: number;
  voting_amount: string;
  voted: boolean;
  venft: Array<{
    id: number;
    amount: string;
    rebase_amount: string;
    lockEnd: number;
    vote_ts: number;
    account: string;
    token: string;
  }>;
  votes: Array<{
    pair: string;
    weight: string;
  }>;
}

type UserStore = {
  account?: string;
  ownedNFTs: NFTWithAssignedValue[];
  loadingNFTs: boolean;
  reETHPrice: number | null;
  lockedTokenPrice: number | null;
  voteDataVenft: VoteData | null; // Renamed for clarity
  voteDataVerwa: VoteDataVerwa | null; // New field for VERWA
  setAccount: (account?: string) => void;
  setOwnedNFTs: (nfts: NFTWithAssignedValue[]) => void;
  setLoadingNFTs: (loading: boolean) => void;
  setReEthPrice: (price: number | null) => void;
  setLockedTokenPrice: (price: number | null) => void;
  setVoteDataVenft: (voteData: VoteData | null) => void; // New setter for VENFT
  setVoteDataVerwa: (voteData: VoteDataVerwa | null) => void; // New setter for VERWA
};

export const useUserStore = create<UserStore>((set) => ({
  account: undefined,
  ownedNFTs: [],
  loadingNFTs: false,
  reETHPrice: null,
  lockedTokenPrice: null,
  voteDataVenft: null, // Initialize VENFT vote data
  voteDataVerwa: null, // Initialize VERWA vote data
  setAccount: (account) => set({ account }),
  setOwnedNFTs: (nfts) => set({ ownedNFTs: nfts }),
  setLoadingNFTs: (loading) => set({ loadingNFTs: loading }),
  setReEthPrice: (price) => set({ reETHPrice: price }),
  setLockedTokenPrice: (price) => set({ lockedTokenPrice: price }),
  setVoteDataVenft: (voteData) => set({ voteDataVenft: voteData }), // New setter for VENFT
  setVoteDataVerwa: (voteData) => set({ voteDataVerwa: voteData }), // New setter for VERWA
}));
