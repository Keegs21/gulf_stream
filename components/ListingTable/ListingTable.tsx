// src/components/MarketGrid.tsx
//@ts-nocheck
'use client';

import React from "react";
import Image from 'next/image';
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { Box, CircularProgress, Typography } from "@mui/material";
import { convertReEthToUsd, convertReEthToUsdNumber, calculateSaleRatio } from "@/util/priceUtils"; // Import the utility functions

type MarketGridProps = {
  overrideOnclickBehavior?: (nft: any) => void;
  customStyles?: React.CSSProperties;
  emptyText: string;
};

const ListingTable: React.FC<MarketGridProps> = ({
  overrideOnclickBehavior,
  customStyles = {},
  emptyText,
}) => {
  // Fetch data from useMarketplaceStore
  const { nftData, loadingListings, loadingAuctions, reEthPrice } = useMarketplaceStore();

  if (loadingListings || loadingAuctions) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress color="inherit" />
      </Box>
    ); // Replace with a more sophisticated loading component if desired
  }

  if (nftData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography variant="h6" align="center" color="textSecondary">
          {emptyText}
        </Typography>
      </Box>
    );
  }

  const rows = nftData.map((nft) => {
    // Determine the price details based on listing type
    let priceDisplay = "N/A";
    let usdPrice = "N/A";
    let usdPriceNumber: number | null = null;

    if (nft.directListing) {
      const reEthAmount = nft.directListing.currencyValuePerToken.displayValue;
      priceDisplay = `${reEthAmount} ${nft.directListing.currencyValuePerToken.symbol}`;
      usdPrice = convertReEthToUsd(reEthAmount, reEthPrice);
      usdPriceNumber = convertReEthToUsdNumber(reEthAmount, reEthPrice);
    } else if (nft.auctionListing) {
      const reEthAmount = nft.auctionListing.minimumBidCurrencyValue.displayValue;
      priceDisplay = `${reEthAmount} ${nft.auctionListing.minimumBidCurrencyValue.symbol}`;
      usdPrice = convertReEthToUsd(reEthAmount, reEthPrice);
      usdPriceNumber = convertReEthToUsdNumber(reEthAmount, reEthPrice);
    }


    // Extract listing expiration time
    const formatTimestamp = (timestampInSeconds: number | bigint): string => {
      const timestampNumber = typeof timestampInSeconds === "bigint" ? Number(timestampInSeconds) : timestampInSeconds;
      if (!timestampNumber || isNaN(timestampNumber)) return "Unknown";
      return new Date(timestampNumber * 1000).toLocaleString();
    };

    const listingEndTime = nft.directListing
      ? formatTimestamp(nft.directListing.endTimeInSeconds)
      : nft.auctionListing
      ? formatTimestamp(nft.auctionListing.endTimeInSeconds)
      : "Unknown";

    // Calculate Sale Ratio
    const saleRatio = usdPriceNumber && nft.nft?.metadata.assignedValue > 0
      ? calculateSaleRatio(usdPriceNumber, nft.nft.metadata.assignedValue)
      : "N/A";

    return {
      id: nft.tokenId,
      name: nft.nft?.metadata.name || "Unnamed NFT",
      image: nft.nft?.metadata.image || "",
      tokenId: nft.tokenId,
      price: `${priceDisplay} (${usdPrice})`,
      type: nft.directListing
        ? "Direct Listing"
        : nft.auctionListing
        ? "Auction"
        : "N/A",
      expiration: listingEndTime, // Replace Status with Expiration
      description: nft.nft?.metadata.description || "No description available.",
      createdAt: nft.nft?.metadata.createdAt || "Unknown",
      NFTValue: nft.nft?.metadata.assignedValue || 0, // Include NFTValue
      lockedTokenAmount: nft.nft?.metadata.lockedTokenAmount || 0, // Include lockedTokenAmount
      SaleRatio: saleRatio, // Include SaleRatio
      // Add any additional fields you require
    };
  });

  const columns: GridColDef[] = [
    {
      field: "image",
      headerName: "Image",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Image
          src={params.value}
          alt={`${params.row.name} Image`} // Enhanced alt attribute
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: "8px" }}
          loading="lazy" // Lazy loading for performance
        />
      ),
    },
    { field: "tokenId", headerName: "Token ID", width: 100 },
    { field: "type", headerName: "Listing Type", width: 150 },
    {
      field: "lockedTokenAmount",
      headerName: "Locked Tokens",
      width: 150,
      sortable: true, // Enable sorting
      filterable: true, // Enable filtering
      renderCell: (params) => {
        const formattedLockedTokens = params.value
          ? `${params.value.toFixed(2)} Pearl`
          : "N/A";
        return <span>{formattedLockedTokens}</span>;
      },
    },
    {
      field: "NFTValue",
      headerName: "NFT Value",
      width: 150,
      sortable: true, // Enable sorting
      filterable: true, // Enable filtering
      renderCell: (params) => {
        const formattedValue = params.value
          ? `$${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "N/A";
        return <span>{formattedValue}</span>;
      },
    },
    { field: "price", headerName: "Price", width: 200 },
    {
      field: "SaleRatio",
      headerName: "Sale Ratio",
      width: 150,
      sortable: true, // Enable sorting
      filterable: true, // Enable filtering
      renderCell: (params) => {
        const formattedRatio = params.value !== "N/A" ? `${params.value}` : "N/A";
        return <span>{formattedRatio}</span>;
      },
    },
    {
      field: "expiration",
      headerName: "Expiration",
      width: 200,
      sortable: true, // Enable sorting
      filterable: true, // Enable filtering
      renderCell: (params) => {
        const formattedExpiration = params.value !== "Unknown" ? `${params.value}` : "N/A";
        return <span>{formattedExpiration}</span>;
      },
    },
    // Add additional columns here if needed
  ];

  const handleRowClick = (params: GridRowParams) => {
    if (overrideOnclickBehavior) {
      const selectedNft = nftData.find((nft) => nft.tokenId === params.id)?.nft;
      if (selectedNft) {
        overrideOnclickBehavior(selectedNft);
      }
    }
  };

  return (
    <Box sx={{ height: 600, width: "100%", ...customStyles }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        onRowClick={(params) => handleRowClick(params)}
        disableRowSelectionOnClick
        sx={{
          backgroundImage: 'linear-gradient(to right, #ff9e38, #5dddff)', 
        }}
        // Additional DataGrid props can be added here
      />
    </Box>
  );
};

export default ListingTable;