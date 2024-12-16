//@ts-nocheck
"use client";

import React from "react";
import { MediaRenderer } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { useUserStore, NFTWithAssignedValue } from "@/store/useUserStore";
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { ethers } from "ethers";
import { Cross1Icon } from '@radix-ui/react-icons';
import { VERWA_ADDRESS, PEARL_ADDRESS, REETH_ADDRESS, NFT_COLLECTION_ADDRESS, RWALISTING_ADDRESS, VERWA, RWA_LISTING, RWA_ADDRESS, USDC_ADDRESS } from "@/const/contracts";
import Image from 'next/image'; // Import Next.js Image component if needed

type Props = {
  tokenId: string;
  nft?: NFTWithAssignedValue['nft'];
  directListing?: any;
  auctionListing?: any;
  overrideOnclickBehavior?: (nft: any) => void;
};

const NFTComponent: React.FC<Props> = ({
  tokenId,
  nft,
  directListing,
  auctionListing,
  overrideOnclickBehavior,
}) => {
  const router = useRouter();
  const reEthPrice = useMarketplaceStore((state) => state.reEthPrice);
  const lockedTokenPrice = useMarketplaceStore((state) => state.lockedTokenPrice);
  const rwaPrice = useMarketplaceStore((state) => state.rwaPrice);

  // Retrieve user data if available
  const userNFT = useUserStore((state) =>
    state.ownedNFTs.find((item) => item.tokenId === tokenId)
  );

  // Retrieve marketplace data if available
  const marketplaceNFT = useMarketplaceStore((state) =>
    state.nftData.find((item) => item.tokenId === tokenId)
  );

  const handleClick = () => {
    if (overrideOnclickBehavior && nft) {
      overrideOnclickBehavior(nft);
    } else {
      router.push(`/token/${nft?.contractAddress}/${tokenId}`);
    }
  };

  const calculateUsd = (
    amount: string | number,
    currencyAddress: string | undefined
  ): string => {
    const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(parsedAmount)) {
      return "Invalid Amount";
    }

    if (!currencyAddress) {
      return "Currency Not Specified";
    }

    if (currencyAddress.toLowerCase() === PEARL_ADDRESS.toLowerCase()) {
      if (lockedTokenPrice && !isNaN(lockedTokenPrice)) {
        const usd = parsedAmount * lockedTokenPrice;
        return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return "Loading...";
    } else if (currencyAddress.toLowerCase() === REETH_ADDRESS.toLowerCase()) {
      if (reEthPrice && !isNaN(reEthPrice)) {
        const usd = parsedAmount * reEthPrice;
        return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return "Loading...";
    } else if (currencyAddress.toLowerCase() === RWA_ADDRESS.toLowerCase()) {
      if (rwaPrice && !isNaN(rwaPrice)) {
        const usd = parsedAmount * rwaPrice;
        return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return "Loading...";
    } else if (currencyAddress.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
      return `$${parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return "Unknown Currency";
    }
  };

  const formatTimestamp = (timestampInSeconds: number | bigint): string => {
    const timestampNumber = typeof timestampInSeconds === "bigint" ? Number(timestampInSeconds) : timestampInSeconds;
    if (!timestampNumber || isNaN(timestampNumber)) return "Unknown";
    return new Date(timestampNumber * 1000).toLocaleString();
  };

  const listingEndTime = directListing
    ? formatTimestamp(directListing.endTimeInSeconds)
    : auctionListing
    ? formatTimestamp(auctionListing.endTimeInSeconds)
    : "Unknown";

  // Determine which data to display for Locked Amount and Estimated Value
  const getLockedTokenAmount = () => {
    if (marketplaceNFT?.nft) {
      const amount = marketplaceNFT.nft.lockedTokenAmount ?? marketplaceNFT.nft.metadata?.lockedTokenAmount;
      if (amount !== undefined && amount > 0) return amount;
    }
    if (userNFT) {
      const amount = userNFT.lockedTokenAmount ?? userNFT.metadata?.lockedTokenAmount;
      if (amount !== undefined && amount > 0) return amount;
    }
    return null;
  };

  const getAssignedValue = () => {
    if (marketplaceNFT?.nft) {
      const value = marketplaceNFT.nft.assignedValue ?? marketplaceNFT.nft.metadata?.assignedValue;
      if (value !== undefined && value > 0) return value;
    }
    if (userNFT) {
      const value = userNFT.assignedValue ?? userNFT.metadata?.assignedValue;
      if (value !== undefined && value > 0) return value;
    }
    return null;
  };

  const displayLockedTokenAmount = getLockedTokenAmount();
  const displayAssignedValue = getAssignedValue();

  // Extract the currency address from the listing
  const listingCurrencyAddress = directListing
    ? directListing.currencyContractAddress
    : auctionListing
    ? auctionListing.currencyContractAddress
    : undefined;

  // Constants

  // Determine NFT type based on contractAddress
  const nftContractAddress = nft?.contractAddress?.toLowerCase();
  const nftContractAddress2 = directListing?.assetContractAddress?.toLowerCase();
  const isPearlNFT = nftContractAddress === PEARL_ADDRESS.toLowerCase();

  // Corrected isVerwaNFT condition
  const isVerwaNFT = 
    nftContractAddress === VERWA_ADDRESS.toLowerCase() || 
    nftContractAddress === RWA_LISTING.address.toLowerCase() ||
    nftContractAddress2 === VERWA_ADDRESS.toLowerCase() || 
    nftContractAddress2 === RWA_LISTING.address.toLowerCase();



  // Token and NFT Names
  const tokenName = isVerwaNFT ? 'RWA' : 'Pearl';
  const nftName = isVerwaNFT ? 'veRWA NFT' : nft?.metadata?.name || "Unnamed NFT";

  const unlockDate = nft?.metadata?.unlockData

  return (
    <div
      className="cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg flex flex-col w-full bg-gradient-to-br from-orange-400 to-blue-500 justify-between border overflow-hidden border-white/10 rounded-lg relative"
      onClick={handleClick}
    >
      {/* NFT Image Section */}
      <div className="relative w-full h-64">
        {isVerwaNFT ? (
          <img
            src="/rwa_image.png" // Ensure this path is correct
            alt="RWA NFT"
            className="object-cover object-center w-full h-full rounded-t-lg"
          />
        ) : nft?.metadata?.image ? (
          <MediaRenderer
            src={nft.metadata.image}
            className="object-cover object-center w-full h-full rounded-t-lg"
            loading="lazy"
            alt={nft?.metadata?.name || `NFT ${tokenId}`}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-500 text-white text-lg rounded-t-lg">
            Image
          </div>
        )}
      </div>

      {/* Text Section with Semi-Transparent Background */}
      <div className="flex flex-col justify-between p-4 bg-black bg-opacity-70 h-full">
        {/* NFT Name and ID */}
        <div>
          <p className="text-lg font-bold text-white truncate whitespace-nowrap">
            {nftName}
          </p>
          <p className="text-sm text-gray-400 truncate whitespace-nowrap">
            #{tokenId}
          </p>
        </div>

        {/* Locked Amount and Estimated Value */}
        <div className="mt-2 flex flex-wrap sm:flex-nowrap space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Locked Amount */}
          <div className="flex-1">
            <p className="text-sm font-medium text-white truncate whitespace-nowrap">
              Locked Amount
            </p>
            <p className="text-lg font-semibold text-white truncate whitespace-nowrap">
              {displayLockedTokenAmount !== null
                ? `${Number(displayLockedTokenAmount).toFixed(2)} ${tokenName}`
                : "N/A"}
            </p>
            <p className="text-sm font-medium text-white truncate whitespace-nowrap">
              Lock End Date
            </p>
            <p className="text-sm text-white/80 truncate whitespace-nowrap">
              {unlockDate}
            </p>
          </div>

          {/* Estimated Value */}
          <div className="flex-1">
            <p className="text-sm font-medium text-white truncate whitespace-nowrap">
              Estimated Value
            </p>
            <p className="text-lg font-semibold text-white truncate whitespace-nowrap">
              {displayAssignedValue !== null
                ? `$${Number(displayAssignedValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Price Section */}
        {(directListing || auctionListing) && (
          <div className="mt-4">
            <p className="text-sm font-medium text-white truncate whitespace-nowrap">
              Price
            </p>
            <p className="text-lg font-semibold text-white truncate whitespace-nowrap">
              {directListing
                ? `${directListing.currencyValuePerToken.displayValue} ${directListing.currencyValuePerToken.symbol} (${calculateUsd(directListing.currencyValuePerToken.displayValue, listingCurrencyAddress)})`
                : auctionListing
                ? `${auctionListing.minimumBidCurrencyValue.displayValue} ${auctionListing.minimumBidCurrencyValue.symbol} (${calculateUsd(auctionListing.minimumBidCurrencyValue.displayValue, listingCurrencyAddress)})`
                : "N/A"}
            </p>
          </div>
        )}

        {/* Timestamps Section */}
        {(directListing || auctionListing) && (
          <div className="mt-2">
            <p className="text-sm font-medium text-white truncate whitespace-nowrap">
              Listing Ends On
            </p>
            <p className="text-sm text-white/80 truncate whitespace-nowrap">
              {listingEndTime}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default NFTComponent;
