// src/components/MarketGrid.tsx
//@ts-nocheck
'use client';

import React from "react";
import Image from 'next/image';
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { Box, CircularProgress, Typography } from "@mui/material";
import { 
  convertReEthToUsd, 
  convertReEthToUsdNumber, 
  convertPearlToUsd, 
  convertPearlToUsdNumber, 
  calculateSaleRatio,
  calculateSalePercentageDifference,
} from "@/util/priceUtils"; // Import the utility functions
import { PEARL_ADDRESS, REETH_ADDRESS, RWA_ADDRESS, USDC_ADDRESS } from "@/const/contracts"; // Ensure REETH_ADDRESS and USDC_ADDRESS are imported

type MarketGridProps = {
  overrideOnclickBehavior?: (nft: any) => void;
  customStyles?: React.CSSProperties;
  emptyText: string;
};

const ListingTable: React.FC<MarketGridProps> = ({
  overrideOnclickBehavior,
  customStyles = {},
  emptyText,
  lockedTokenAmounts,
}) => {
  // Fetch data from useMarketplaceStore
  const { nftData, loadingListings, loadingAuctions, reEthPrice, lockedTokenPrice, rwaPrice, usdcPrice } = useMarketplaceStore();

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
    let currencyAddress: string | undefined = undefined;

    if (nft.directListing) {
      const reEthAmount = nft.directListing.currencyValuePerToken.displayValue;
      priceDisplay = `${reEthAmount} ${nft.directListing.currencyValuePerToken.symbol}`;
      currencyAddress = nft.directListing.currencyContractAddress;

      if (currencyAddress.toLowerCase() === PEARL_ADDRESS.toLowerCase()) {
        usdPrice = convertPearlToUsd(reEthAmount, lockedTokenPrice);
        usdPriceNumber = convertPearlToUsdNumber(reEthAmount, lockedTokenPrice);
      } else if (currencyAddress.toLowerCase() === REETH_ADDRESS.toLowerCase()) {
        usdPrice = convertReEthToUsd(reEthAmount, reEthPrice);
        usdPriceNumber = convertReEthToUsdNumber(reEthAmount, reEthPrice);
      } else if (currencyAddress.toLowerCase() === RWA_ADDRESS.toLowerCase()) {
        usdPrice = convertReEthToUsd(reEthAmount, rwaPrice);
        usdPriceNumber = convertReEthToUsdNumber(reEthAmount, rwaPrice);
      } else if (currencyAddress.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
        usdPrice = reEthAmount
        usdPriceNumber = parseFloat(reEthAmount);
      } else {
        usdPrice = "Unknown Currency";
        usdPriceNumber = null;
      }

    } else if (nft.auctionListing) {
      const reEthAmount = nft.auctionListing.minimumBidCurrencyValue.displayValue;
      priceDisplay = `${reEthAmount} ${nft.auctionListing.minimumBidCurrencyValue.symbol}`;
      currencyAddress = nft.auctionListing.currency;

      if (currencyAddress.toLowerCase() === PEARL_ADDRESS.toLowerCase()) {
        usdPrice = convertPearlToUsd(reEthAmount, lockedTokenPrice);
        usdPriceNumber = convertPearlToUsdNumber(reEthAmount, lockedTokenPrice);
      } else if (currencyAddress.toLowerCase() === REETH_ADDRESS.toLowerCase()) {
        usdPrice = convertReEthToUsd(reEthAmount, reEthPrice);
        usdPriceNumber = convertReEthToUsdNumber(reEthAmount, reEthPrice);
      } else {
        usdPrice = "Unknown Currency";
        usdPriceNumber = null;
      }
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
      ? calculateSalePercentageDifference(usdPriceNumber, nft.nft.metadata.assignedValue)
      : "N/A";


    return {
      id: nft.tokenId,
      name: nft.nft?.metadata.name || "Unnamed NFT",
      image: nft.nft?.metadata.image || "NFT",
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
      lockedTokenAmount: lockedTokenAmounts[nft.tokenId] !== null
      ? lockedTokenAmounts[nft.tokenId].toFixed(2)
      : "N/A", // Use the duplicated logic
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
        <img
          src={params.value}
          alt="NFT Image" // Descriptive alt text
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: "8px" }}
          loading="lazy" // Lazy loading for performance
          onError={(e) => {
            if (e.target.src !== '/rwa_image2.png') {
              e.target.src = '/rwa_image2.png'; // Set fallback image on error
            }
          }}
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
        const formattedLockedTokens =
          typeof params.value === 'string' ? params.value : "N/A";
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
    {
      field: "price",
      headerName: "Price",
      width: 250,
      renderCell: (params) => (
        <span>
          {params.value}
        </span>
      ),
    },
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
      headerName: "Listing Expiration",
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
          backgroundImage: 'linear-gradient(to right, #001a33 0%, #0294fe 50%, #cc7000 100%)',
          backgroundBlendMode: 'overlay',
          color: 'white',
          '& .MuiDataGrid-columnHeaders': {
            color: 'black',
          },
        }}
        
        // Additional DataGrid props can be added here
      />
    </Box>
  );
};

export default ListingTable;
