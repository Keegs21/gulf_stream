// src/store/useMarketplaceStore.ts

import { create } from 'zustand';
import { MARKETPLACE } from '@/const/contracts';

// Define Interfaces
export interface SanitizedDirectListing {
  id: string;
  assetContractAddress: string;
  tokenId: string;
  startTime: Date;
  endTime: Date;
  quantity: number;
  currencyContractAddress: string;
  buyoutPricePerToken: number;
  sellerAddress: string;
  // Include other necessary fields
}

export interface SanitizedEnglishAuction {
  id: string;
  assetContractAddress: string;
  tokenId: string;
  startTime: Date;
  endTime: Date;
  quantity: number;
  currencyContractAddress: string;
  buyoutPricePerToken: number;
  sellerAddress: string;
  // Define fields similar to above
}

export interface NFTMetadata {
  name?: string;
  image?: string;
  lockedTokenAmount?: number;
  assignedValue?: number;
  [key: string]: any;
}

export interface NFTContract {
  contractAddress: string;
  id: string;
  metadata: NFTMetadata;
  owner?: string;
}

export interface NFTData {
  tokenId: string;
  nft?: NFTContract;
  directListing?: SanitizedDirectListing;
  auctionListing?: SanitizedEnglishAuction;
  // Add other properties as needed
}

export interface MarketplaceState {
  listings: SanitizedDirectListing[];
  auctions: SanitizedEnglishAuction[];
  nftData: NFTData[];
  reEthPrice: number | null;
  lockedTokenPrice: number | null;
  totalVolume: number; // Existing State Variable
  rwaPrice: number | null; // New State Variable
  usdcPrice: number | null; // Added usdcPrice here
  loadingListings: boolean;
  loadingAuctions: boolean;

  // Existing setter functions
  setListings: (listings: SanitizedDirectListing[]) => void;
  setAuctions: (auctions: SanitizedEnglishAuction[]) => void;
  setNftData: (nftData: NFTData[]) => void;
  setReEthPrice: (price: number | null) => void;
  setUsdcPrice: (price: number | null) => void; 
  setLockedTokenPrice: (price: number | null) => void;
  setTotalVolume: (volume: number) => void;
  setLoadingListings: (loading: boolean) => void;
  setLoadingAuctions: (loading: boolean) => void;

  // New setter function
  setRwaPrice: (price: number | null) => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  listings: [],
  auctions: [],
  nftData: [],
  reEthPrice: null,
  lockedTokenPrice: null,
  totalVolume: 0, // Initialize totalVolume
  rwaPrice: null, // Initialize rwaPrice
  usdcPrice: null, // Initialize USDC price


  loadingListings: false,
  loadingAuctions: false,

  // Existing setter functions
  setListings: (listings) => {
    set({ listings });
  },
  setAuctions: (auctions) => {
    set({ auctions });
  },
  setNftData: (nftData) => {
    const currentNftData = get().nftData;

    // Check if the new nftData is different from the current one
    const isDifferent =
      nftData.length !== currentNftData.length ||
      nftData.some((newNft, index) => {
        const currentNft = currentNftData[index];
        return (
          newNft.tokenId !== currentNft?.tokenId ||
          newNft.nft?.contractAddress !== currentNft?.nft?.contractAddress ||
          newNft.nft?.metadata.lockedTokenAmount !== currentNft?.nft?.metadata.lockedTokenAmount ||
          newNft.nft?.metadata.assignedValue !== currentNft?.nft?.metadata.assignedValue ||
          newNft.nft?.metadata.unlockData !== currentNft?.nft?.metadata.unlockData
        );
      });

    if (isDifferent) {
      set({ nftData });
    }
    // If data is the same, do not update to prevent re-renders
  },
  setReEthPrice: (price) => set({ reEthPrice: price }),
  setLockedTokenPrice: (price) => set({ lockedTokenPrice: price }),
  setUsdcPrice: (price) => set({ usdcPrice: price }),
  setTotalVolume: (volume) => set({ totalVolume: volume }), 
  setLoadingListings: (loading) => set({ loadingListings: loading }),
  setLoadingAuctions: (loading) => set({ loadingAuctions: loading }),

  // New setter function
  setRwaPrice: (price) => set({ rwaPrice: price }),
}));
