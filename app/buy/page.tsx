// src/pages/buy.tsx
//@ts-nocheck
'use client';

import React, { useState, useEffect, useContext } from "react";
import { CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ListingGrid from "@/components/ListingGrid/ListingGrid"; // Ensure correct import path
import ListingTable from "@/components/ListingTable/ListingTable"; // Ensure correct import path
import { useMarketplaceStore } from '@/store/useMarketplaceStore'; // Import the store
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { MarketplaceDataContext } from '@/components/MarketplaceProvider/MarketplaceProvider'; // Adjust the import path



const Buy: React.FC = () => {
  const [view, setView] = useState<'grid' | 'table'>('table');
  const router = useRouter();
  const marketplaceDataContext = useContext(MarketplaceDataContext);


  // Access totalVolume, loading states, and error from the store
  const totalVolume = useMarketplaceStore((state) => state.totalVolume);
  const loadingVolume = useMarketplaceStore((state) => state.loadingListings || state.loadingAuctions);
  const errorVolume = useMarketplaceStore((state) => state.error);
  const { nftData, loadingListings, listings } = useMarketplaceStore();

  // Pull prices from the store
  const reEthPrice = useMarketplaceStore((state) => state.reEthPrice);
  const lockedTokenPrice = useMarketplaceStore((state) => state.lockedTokenPrice);
  const rwaPrice = useMarketplaceStore((state) => state.rwaPrice);

  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'grid' | 'table' | null
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  useEffect(() => {
    if (nftData.length > 0 && marketplaceDataContext?.fetchVoteData) {
      marketplaceDataContext.fetchVoteData();
    }
  }, [nftData, marketplaceDataContext?.fetchVoteData]);

  // Calculate total volume in USD
  const totalVolumeUSD = reEthPrice !== null ? totalVolume * reEthPrice : 0;
  const totalVolumeUSD2dp = totalVolumeUSD.toFixed(2);
  const reEthPrice2dp = parseFloat(reEthPrice).toFixed(2);
  const lockedTokenPrice2dp = parseFloat(lockedTokenPrice).toFixed(4);
  const rwaPrice2dp = parseFloat(rwaPrice).toFixed(4);

  // Prepare token data
  const tokens = [
    {
      name: 'reETH',
      price: reEthPrice2dp,
    },
    {
      name: 'Pearl',
      price: lockedTokenPrice2dp,
    },
    {
      name: 'RWA',
      price: rwaPrice2dp,
    },
  ];

  // PriceCard Component
  const PriceCard = ({ token }) => (
    <div className="bg-white/[.08] rounded-lg p-4 flex items-center space-x-4 w-64">
      <div>
        <p className="text-xl font-semibold text-white">{token.name}</p>
        </div>
        <div className="text-transparent bg-clip-text gradient-orange-blue text-lg sm:text-xl">
        <p>${token.price}</p>
      </div>
    </div>
  );

  // Duplicate Logic: Compute lockedTokenAmount for each NFT
  const computeLockedTokenAmount = (nft) => {
    // Retrieve marketplaceNFT
    const marketplaceNFT = nftData.find((item) => item.tokenId === nft.tokenId)?.nft;

    // Get lockedTokenAmount from marketplaceNFT or userNFT
    const amount = marketplaceNFT?.metadata?.lockedTokenAmount

    // Return parsed float or null
    return amount !== undefined && amount > 0 ? parseFloat(amount) : null;
  };

  // Prepare a mapping of tokenId to lockedTokenAmount
  const lockedTokenAmounts = nftData.reduce((acc, nft) => {
    acc[nft.tokenId] = computeLockedTokenAmount(nft);
    return acc;
  }, {});

  // Fetch all necessary data when the component mounts
  useEffect(() => {
    if (nftData.length > 0 && marketplaceDataContext?.fetchVoteData) {
      marketplaceDataContext.fetchVoteData();
    }
  }, [nftData, marketplaceDataContext?.fetchVoteData]);

  return (
    <div className="px-8 py-8">
      {/* Header Section with Total Volume */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-[#5dddff]/10 rounded-lg p-8">
        <h1 className="text-4xl text-white font-bold">NFTs on Market</h1>
        <div className="mt-4 sm:mt-0">
          {loadingVolume ? (
            <div className="flex items-center">
              <CircularProgress size={24} className="text-white mr-2" />
              <span className="text-white">Calculating Stats...</span>
            </div>
          ) : errorVolume ? (
            <span className="text-red-500">Error fetching volume</span>
          ) : (
            <div>
              <div className="flex flex-wrap justify-center sm:justify-start space-x-4">
                {tokens.map((token) => (
                  <PriceCard key={token.name} token={token} />
                ))}
              </div>
              <div className="text-transparent bg-clip-text gradient-orange-blue text-lg sm:text-xl mb-4">
                Gulf Stream Total Volume: ${totalVolumeUSD2dp}
              </div>
            </div>
          )}
        </div>
        </div>

      {/* Toggle Buttons */}
      <div className="flex justify-center mb-4">
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleToggle}
          aria-label="view toggle"
          sx={{
        '& .MuiToggleButton-root': {
          color: 'white',
          borderColor: 'orange',
          '&.Mui-selected': {
            color: 'orange',
            borderColor: 'orange',
          },
        },
          }}
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
      {view === 'grid' ? (
        <ListingGrid
          emptyText={"Looks like there are no listed NFTs in this collection."}
          overrideOnclickBehavior={(nft) => {
            router.push(`/token/${nft.contractAddress}/${nft.id}`);
          }}
        />
      ) : (
        <ListingTable
          emptyText={"Looks like there are no listed NFTs in this collection."}
          overrideOnclickBehavior={(nft) => {
            router.push(`/token/${nft.contractAddress}/${nft.id}`);
          }}
          lockedTokenAmounts={lockedTokenAmounts} // Pass the lockedTokenAmounts mapping
        />
      )}
    </div>
  );
};

export default Buy;
