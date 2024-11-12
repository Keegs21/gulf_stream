// src/components/NFT/NFTGrid.tsx
import React from "react";
import NFTComponent from "./NFT"; // Ensure correct import

export type NFTData = {
  tokenId: string;
  nft?: {
    contractAddress: string;
    id: string | number;
    metadata: {
      name?: string;
      image?: string;
      [key: string]: any; // Add other metadata fields as needed
    };
    owner?: string;
    // Add other NFT properties as needed
  };
  directListing?: {
    currencyValuePerToken: {
      displayValue: string;
      symbol: string;
    };
    // Add other DirectListing properties as needed
  };
  auctionListing?: {
    buyoutCurrencyValue: {
      displayValue: string;
      symbol: string;
    };
    minimumBidCurrencyValue: {
      displayValue: string;
      symbol: string;
    };
    // Add other EnglishAuction properties as needed
  };
};

type NFTGridProps = {
  nftData: NFTData[];
  emptyText: string;
  overrideOnclickBehavior?: (nft: any) => void;
};

export const NFTGridLoading: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="w-full h-[350px] bg-gray-700 animate-pulse rounded-lg" />
    ))}
  </div>
);

const NFTGrid: React.FC<NFTGridProps> = ({ nftData, emptyText, overrideOnclickBehavior }) => {
  if (nftData.length === 0) {
    return <p className="text-center text-white">{emptyText}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
      {nftData.map((nft) => (
        <NFTComponent
          key={nft.tokenId}
          tokenId={nft.tokenId}
          nft={nft.nft}
          directListing={nft.directListing}
          auctionListing={nft.auctionListing}
          overrideOnclickBehavior={overrideOnclickBehavior}
        />
      ))}
    </div>
  );
};

export default NFTGrid;
