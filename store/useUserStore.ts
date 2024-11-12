//@ts-nocheck
import { create } from 'zustand';
import { NFT } from 'thirdweb';

export interface NFTWithAssignedValue extends NFT {
  tokenId: string;          // Added tokenId as a string
  lockedTokenAmount: number;
  assignedValue: number;
  amount: string;           // Amount from vote contract
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

type UserStore = {
  account?: string;
  ownedNFTs: NFTWithAssignedValue[];
  loadingNFTs: boolean;
  reETHPrice: number | null;
  lockedTokenPrice: number | null;
  voteData: VoteData | null;
  setAccount: (account?: string) => void;
  setOwnedNFTs: (nfts: NFTWithAssignedValue[]) => void;
  setLoadingNFTs: (loading: boolean) => void;
  setReEthPrice: (price: number | null) => void;
  setLockedTokenPrice: (price: number | null) => void;
  setVoteData: (voteData: VoteData | null) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  account: undefined,
  ownedNFTs: [],
  loadingNFTs: false,
  reETHPrice: null,
  lockedTokenPrice: null,
  voteData: null,
  setAccount: (account) => set({ account }),
  setOwnedNFTs: (nfts) => set({ ownedNFTs: nfts }),
  setLoadingNFTs: (loading) => set({ loadingNFTs: loading }),
  setReEthPrice: (price) => set({ reETHPrice: price }),
  setLockedTokenPrice: (price) => set({ lockedTokenPrice: price }),
  setVoteData: (voteData) => set({ voteData }),
}));
