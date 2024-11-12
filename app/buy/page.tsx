// src/pages/buy.tsx
'use client';

import React, { useState } from "react";
import { CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ListingGrid from "@/components/ListingGrid/ListingGrid"; // Ensure correct import path
import ListingTable from "@/components/ListingTable/ListingTable"; // Ensure correct import path
import { NFTGridLoading } from "@/components/NFT/NFTGrid"; // Reuse loading component
import { useRouter } from "next/navigation";


const Buy: React.FC = () => {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const router = useRouter();


  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'grid' | 'table' | null
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <div className="px-8 py-4">
      {/* Header Section */}
      <h1 className="text-4xl text-white font-bold mb-6">vePearl NFTs for Sale</h1>

      {/* Toggle Buttons */}
      <div className="flex justify-end mb-4">
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleToggle}
          aria-label="view toggle"
          color="primary"
        >
          <ToggleButton value="grid" aria-label="grid view">
            Grid View
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
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
