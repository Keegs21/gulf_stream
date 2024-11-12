//@ts-nocheck
"use client";

import React from "react";
import { MediaRenderer } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { NFT_COLLECTION } from "@/const/contracts";
import client from "@/lib/client";
import { useUserStore, NFTWithAssignedValue } from "@/store/useUserStore"; // Import the extended NFT type
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { ethers } from "ethers"; // Import ethers for conversion
import { Cross1Icon } from '@radix-ui/react-icons'; // Ensure this is imported if used

type Props = {
  tokenId: string;
  nft?: NFTWithAssignedValue['nft'];
  directListing?: NFTWithAssignedValue['directListing'];
  auctionListing?: NFTWithAssignedValue['auctionListing'];
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

  const calculateUsd = (reEthAmount: string | number): string => {
    const amount = typeof reEthAmount === "string" ? parseFloat(reEthAmount) : reEthAmount;
    if (reEthPrice && !isNaN(amount)) {
      const usd = amount * reEthPrice;
      return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return "Loading...";
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
  const displayLockedTokenAmount =
    marketplaceNFT?.nft?.metadata.lockedTokenAmount !== undefined && marketplaceNFT.nft.metadata.lockedTokenAmount > 0
      ? marketplaceNFT.nft.metadata.lockedTokenAmount
      : userNFT?.lockedTokenAmount !== undefined && userNFT.lockedTokenAmount > 0
      ? userNFT.lockedTokenAmount
      : null;

  const displayAssignedValue =
    marketplaceNFT?.nft?.metadata.assignedValue !== undefined && marketplaceNFT.nft.metadata.assignedValue > 0
      ? marketplaceNFT.nft.metadata.assignedValue
      : userNFT?.assignedValue !== undefined && userNFT.assignedValue > 0
      ? userNFT.assignedValue
      : null;

  return (
    <div
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col w-full bg-gradient-to-br from-orange-400 to-blue-500 justify-between border overflow-hidden border-white/10 rounded-lg relative"
      onClick={handleClick}
    >
      {/* NFT Image Section */}
      <div className="relative w-full h-64">
        {nft?.metadata.image && (
          <MediaRenderer
            src={nft.metadata.image}
            client={client}
            className="object-cover object-center w-full h-full rounded-t-lg"
            loading="lazy" // Lazy loading for performance
            alt={nft.metadata.name || `NFT ${tokenId}`} // Enhanced alt attribute
          />
        )}
      </div>

      {/* Text Section with Semi-Transparent Background */}
      <div className="flex flex-col justify-between p-4 bg-black bg-opacity-70">
        {/* NFT Name and ID */}
        <div>
          <p className="text-lg font-bold text-white truncate">
            {nft?.metadata.name || "Unnamed NFT"}
          </p>
          <p className="text-sm text-gray-400">
            #{tokenId}
          </p>
        </div>

        {/* Locked Amount */}
        <div className="mt-2">
          <p className="text-sm font-medium text-white">Locked Amount</p>
          <p className="text-lg font-semibold text-white">
            {displayLockedTokenAmount !== null
              ? `${Number(displayLockedTokenAmount).toFixed(2)} Pearl`
              : "N/A"}
          </p>
        </div>

        {/* Assigned Value Section */}
        <div className="mt-2">
          <p className="text-sm font-medium text-white">Estimated Value</p>
          <p className="text-lg font-semibold text-white">
            {displayAssignedValue !== null
              ? `$${Number(displayAssignedValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "N/A"}
          </p>
        </div>

        {/* Price Section */}
        {(directListing || auctionListing) && (
          <div className="mt-2">
            <p className="text-sm font-medium text-white">Price</p>
            <p className="text-lg font-semibold text-white">
              {directListing
                ? `${directListing.currencyValuePerToken.displayValue} ${directListing.currencyValuePerToken.symbol} (${calculateUsd(directListing.currencyValuePerToken.displayValue)})`
                : auctionListing
                ? `${auctionListing.minimumBidCurrencyValue.displayValue} ${auctionListing.minimumBidCurrencyValue.symbol} (${calculateUsd(auctionListing.minimumBidCurrencyValue.displayValue)})`
                : "N/A"}
            </p>
          </div>
        )}

        {/* Timestamps Section */}
        {(directListing || auctionListing) && (
          <div className="mt-2">
            <p className="text-sm font-medium text-white">Listing Ends On</p>
            <p className="text-sm text-white/80">{listingEndTime}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTComponent;
