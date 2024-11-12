// src/pages/buy.tsx
//@ts-nocheck
'use client';

import React, { useState } from "react";
import { CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ListingGrid from "@/components/ListingGrid/ListingGrid"; // Ensure correct import path
import ListingTable from "@/components/ListingTable/ListingTable"; // Ensure correct import path
import { useMarketplaceStore } from '@/store/useMarketplaceStore'; // Import the store
import { useRouter } from "next/navigation";

const Buy: React.FC = () => {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const router = useRouter();

  // Access totalVolume, loading states, and error from the store
  const totalVolume = useMarketplaceStore((state) => state.totalVolume);
  const loadingVolume = useMarketplaceStore((state) => state.loadingListings || state.loadingAuctions);
  const errorVolume = useMarketplaceStore((state) => state.error);

  //pull reETH price from userstore
  const reEthPrice = useMarketplaceStore((state) => state.reEthPrice);

  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'grid' | 'table' | null
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };


  //calculate total volume in USD
  const totalVolumeUSD = reEthPrice !== null ? totalVolume * reEthPrice : 0;
  //total volume USD to 2 decimal places
  const totalVolumeUSD2dp = totalVolumeUSD.toFixed(2);

  return (
    <div className="px-8 py-4">
      {/* Header Section with Total Volume */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-4xl text-white font-bold">Listed NFTs</h1>
        <div className="mt-4 sm:mt-0">
          {loadingVolume ? (
            <div className="flex items-center">
              <CircularProgress size={24} className="text-white mr-2" />
              <span className="text-white">Calculating Total Volume...</span>
            </div>
          ) : errorVolume ? (
            <span className="text-red-500">Error fetching volume</span>
          ) : (
            <span className="text-lg text-white">
              Total Volume: ${totalVolumeUSD2dp} ({totalVolume} reETH)
            </span>
          )}
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex justify-end mb-4">
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleToggle}
          aria-label="view toggle"
          color="primary"
        >
          <ToggleButton value="grid" aria-label="grid view" sx={{ color: 'white' }}>
            Grid View
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view" sx={{ color: 'white' }}>
            Table View
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* Listing Grid/Table Section */}
      <div className="my-8">
        {view === 'grid' ? (
          <ListingGrid
            emptyText={"Looks like there are no listed NFTs in this collection."}
            overrideOnclickBehavior={(nft) => {
              // Handle NFT click, e.g., navigate to detail page
              // Example:
              router.push(`/token/${nft.contractAddress}/${nft.id}`);
            }}
          />
        ) : (
          <ListingTable
            emptyText={"Looks like there are no listed NFTs in this collection."}
            overrideOnclickBehavior={(nft) => {
              // Handle NFT click, e.g., navigate to detail page
              // Example:
              router.push(`/token/${nft.contractAddress}/${nft.id}`);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Buy;
