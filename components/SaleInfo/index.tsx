//@ts-nocheck
'use client';

import { NFT as NFTType } from "thirdweb";
import React, { useState } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { ADDRESS_ZERO } from "thirdweb";
import { isApprovedForAll } from "thirdweb/extensions/erc721";
import { MARKETPLACE, NFT_COLLECTION, PEARL_ADDRESS, REETH_ADDRESS, RWA_ADDRESS, VERWA_ADDRESS, NFT_COLLECTION_ADDRESS, RWA_LISTING, USDC_ADDRESS } from "@/const/contracts";
import DirectListingButton from "./DirectListingButton";
import CancelListingButton from "./CancelListingButton";
import cn from "classnames";
import ApprovalButton from "./ApproveButton";
import { DirectListing } from "thirdweb/extensions/marketplace";
import TextField from '@mui/material/TextField';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { useUserStore } from "@/store/useUserStore";
import { FaEthereum, FaGem, FaShieldAlt, FaDollarSign } from 'react-icons/fa'; // Added FaDollarSign for USDC
import { 
  convertReEthToUsd, 
  convertPearlToUsd
} from "@/util/priceUtils";

type SaleInfoProps = {
  nft: NFTType;
};

const INPUT_STYLES =
  "block w-full py-3 px-4 pr-28 mb-4 bg-transparent border border-white text-base box-shadow-md rounded-lg";
const LEGEND_STYLES = "mb-2 text-white/80";

export default function SaleInfo({ nft }: SaleInfoProps) {
  const account = useActiveAccount();
  const [tab, setTab] = useState<"direct" | "auction">("direct");
  
  const { data: hasPearlApproval } = useReadContract(isApprovedForAll, {
    contract: NFT_COLLECTION,
    owner: account?.address || ADDRESS_ZERO,
    operator: MARKETPLACE.address,
  });

  const { data: hasVeRWAApproval } = useReadContract(isApprovedForAll, {
    contract: RWA_LISTING,
    owner: account?.address || ADDRESS_ZERO,
    operator: MARKETPLACE.address,
  });

  const [directListingState, setDirectListingState] = useState({ price: "0" });
  const [endTimestamp, setEndTimestamp] = useState<Date | null>(null);

  // Added USDC to the currency state type.
  const [currency, setCurrency] = useState<"reETH" | "PEARL" | "RWA" | "USDC">("reETH");

  const listings = useMarketplaceStore((state) => state.listings);
  const auctions = useMarketplaceStore((state) => state.auctions);
  const { voteDataVenft, voteDataVerwa } = useUserStore();

  const directListing = listings.find(
    (listing) => listing.tokenId.toString() === nft.tokenId.toString()
  );
  const auctionListing = auctions.find(
    (auction) => auction.tokenId.toString() === nft.tokenId.toString()
  );
  const isListed = !!directListing || !!auctionListing;

  // Fetch prices from the store
  const reEthPrice = useMarketplaceStore((state) => state.reEthPrice);
  const lockedTokenPrice = useMarketplaceStore((state) => state.lockedTokenPrice);
  const rwaPrice = useMarketplaceStore((state) => state.rwaPrice);
  const usdcPrice = useMarketplaceStore((state) => state.usdcPrice); // Ensure this is set in the store

  const usdValue = (() => {
    // Determine the USD value of the currently listed NFT price
    if (directListing) {
      const price = parseFloat(directListing.buyoutPricePerToken);
      const currencyAddress = directListing.currencyContractAddress.toLowerCase();

      if (currencyAddress === PEARL_ADDRESS.toLowerCase()) {
        return convertPearlToUsd(price, lockedTokenPrice);
      } else if (currencyAddress === REETH_ADDRESS.toLowerCase()) {
        return convertReEthToUsd(price, reEthPrice);
      } else if (currencyAddress === RWA_ADDRESS.toLowerCase()) {
        return rwaPrice ? `$${(price * rwaPrice).toFixed(2)}` : "Loading...";
      } else if (currencyAddress === USDC_ADDRESS.toLowerCase()) {
        return usdcPrice ? `$${(price * usdcPrice).toFixed(2)}` : "Loading...";
      } else {
        return "Unknown Currency";
      }
    } else if (auctionListing) {
      const price = parseFloat(auctionListing.minimumBidCurrencyValue.displayValue);
      const currencyAddress = auctionListing.currencyContractAddress.toLowerCase();

      if (currencyAddress === PEARL_ADDRESS.toLowerCase()) {
        return convertPearlToUsd(price, lockedTokenPrice);
      } else if (currencyAddress === REETH_ADDRESS.toLowerCase()) {
        return convertReEthToUsd(price, reEthPrice);
      } else if (currencyAddress === RWA_ADDRESS.toLowerCase()) {
        return rwaPrice ? `$${(price * rwaPrice).toFixed(2)}` : "Loading...";
      } else if (currencyAddress === USDC_ADDRESS.toLowerCase()) {
        return usdcPrice ? `$${(price * usdcPrice).toFixed(2)}` : "Loading...";
      } else {
        return "Unknown Currency";
      }
    }
    return "0.00";
  })();

  // Compute USD value based on the currently entered listing price and selected currency
  const usdValue2 = (() => {
    const price = parseFloat(directListingState.price);
    if (currency === "reETH") {
      return reEthPrice ? `$${(price * reEthPrice).toFixed(2)}` : "0.00";
    } else if (currency === "PEARL") {
      return lockedTokenPrice ? `$${(price * lockedTokenPrice).toFixed(2)}` : "0.00";
    } else if (currency === "RWA") {
      return rwaPrice ? `$${(price * rwaPrice).toFixed(2)}` : "0.00";
    } else if (currency === "USDC") {
      return usdcPrice ? `$${(price * usdcPrice).toFixed(2)}` : "0.00";
    }
    return "0.00";
  })();

  const isVerwaNFT = nft?.contractAddress?.toLowerCase() === VERWA_ADDRESS.toLowerCase();
  const hasVoted = isVerwaNFT ? voteDataVerwa?.voted : voteDataVenft?.voted;
  const hasApproval = isVerwaNFT ? hasVeRWAApproval : hasPearlApproval;
  const approvalContractAddress = isVerwaNFT ? VERWA_ADDRESS : NFT_COLLECTION_ADDRESS;
  const approvalLabel = isVerwaNFT ? "Approve VeRWA" : "Approve PEARL";

  return (
    <>
      <div className="">
        {/* Tabs for Direct Listing and Auction */}
        <div className="flex justify-start w-full mb-6 border-b border-white/60">
          <h3
            className={cn(
              "px-4 h-12 flex items-center justify-center text-base font-semibold cursor-pointer transition-all hover:text-white/80",
              tab === "direct" &&
                "text-[#0294fe] border-b-2 border-[#0294fe]"
            )}
            onClick={() => setTab("direct")}
          >
            Direct Listing
          </h3>
          {/* If you enable auctions, uncomment the following:
          <h3
            className={cn(
              "px-4 h-12 flex items-center justify-center text-base font-semibold cursor-pointer transition-all hover:text-white/80",
              tab === "auction" &&
                "text-[#0294fe] border-b-2 border-[#0294fe]"
            )}
            onClick={() => setTab("auction")}
          >
            Auction
          </h3>
          */}
        </div>

        {/* Direct listing fields */}
        <div className={cn(tab === "direct" ? "flex" : "hidden", "flex-col")}>
          {!isListed ? (
            <>
              <legend className={cn(LEGEND_STYLES)}>
                {currency === "reETH" ? "reETH Listing Price" 
                 : currency === "PEARL" ? "PEARL Listing Price" 
                 : currency === "RWA" ? "RWA Listing Price" 
                 : "USDC Listing Price"}
              </legend>
              <div className="relative">
                <input
                  className={cn(INPUT_STYLES)}
                  type="number"
                  step={0.000001}
                  value={directListingState.price}
                  onChange={(e) =>
                    setDirectListingState({ price: e.target.value })
                  }
                  placeholder={`Enter price in ${currency}`}
                />
                {/* Display USD value */}
                {directListingState.price && (
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80">
                    ({usdValue2})
                  </span>
                )}
              </div>

              {/* Currency Selector */}
              <legend className={cn(LEGEND_STYLES)}>Select Currency</legend>
              <div className="flex space-x-4 mb-4">
                {/* reETH Button */}
                <button
                  onClick={() => setCurrency("reETH")}
                  className={cn(
                    "flex items-center px-4 py-2 border rounded-lg transition-colors duration-200",
                    currency === "reETH"
                      ? "bg-[#5dddff]/50 border-[#5dddff]"
                      : "bg-transparent border-white hover:bg-[#5dddff]/20"
                  )}
                  aria-label="Select reETH as listing currency"
                >
                  <FaEthereum className="w-5 h-5 mr-2" />
                  reETH
                </button>

                {/* PEARL Button */}
                <button
                  onClick={() => setCurrency("PEARL")}
                  className={cn(
                    "flex items-center px-4 py-2 border rounded-lg transition-colors duration-200",
                    currency === "PEARL"
                      ? "bg-[#5dddff]/50 border-[#5dddff]"
                      : "bg-transparent border-white hover:bg-[#5dddff]/20"
                  )}
                  aria-label="Select PEARL as listing currency"
                >
                  <FaGem className="w-5 h-5 mr-2" />
                  PEARL
                </button>

                {/* RWA Button */}
                <button
                  onClick={() => setCurrency("RWA")}
                  className={cn(
                    "flex items-center px-4 py-2 border rounded-lg transition-colors duration-200",
                    currency === "RWA"
                      ? "bg-[#5dddff]/50 border-[#5dddff]"
                      : "bg-transparent border-white hover:bg-[#5dddff]/20"
                  )}
                  aria-label="Select RWA as listing currency"
                >
                  <FaShieldAlt className="w-5 h-5 mr-2" />
                  RWA
                </button>

                {/* USDC Button */}
                <button
                  onClick={() => setCurrency("USDC")}
                  className={cn(
                    "flex items-center px-4 py-2 border rounded-lg transition-colors duration-200",
                    currency === "USDC"
                      ? "bg-[#5dddff]/50 border-[#5dddff]"
                      : "bg-transparent border-white hover:bg-[#5dddff]/20"
                  )}
                  aria-label="Select USDC as listing currency"
                >
                  <FaDollarSign className="w-5 h-5 mr-2" />
                  USDC
                </button>
              </div>

              {/* Datetime picker for listing duration using MUI */}
              <legend className={cn(LEGEND_STYLES)}>Listing Duration</legend>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Select End Date and Time"
                  slotProps={{ openPickerButton: { color: 'primary' } }}
                  sx={{
                    label: { color: 'white' },
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white/60' },
                  }}
                  value={endTimestamp}
                  onChange={(newValue) => {
                    setEndTimestamp(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} className={cn(LEGEND_STYLES)} />}
                  disablePast
                />
              </LocalizationProvider>

              {/* Buttons Section */}
              <div className="mt-6 flex flex-col space-y-4">
                {hasVoted ? (
                  // Disabled button if the NFT has already voted
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg cursor-not-allowed"
                  >
                    Reset votes on Pearl
                  </button>
                ) : (
                  !hasApproval ? (
                    <ApprovalButton
                      contractAddress={approvalContractAddress}
                      label={approvalLabel}
                    />
                  ) : (
                    <DirectListingButton
                      nft={nft}
                      pricePerToken={directListingState.price}
                      endTimestamp={
                        endTimestamp || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      }
                      currency={
                        currency === "PEARL"
                          ? PEARL_ADDRESS
                          : currency === "reETH"
                          ? REETH_ADDRESS
                          : currency === "RWA"
                          ? RWA_ADDRESS
                          : USDC_ADDRESS
                      }
                    />
                  )
                )}
              </div>
            </>
          ) : (
            // If already listed, show Cancel Listing Button
            <div className="mt-6 flex flex-col space-y-4">
              <CancelListingButton nft={directListing} />
            </div>
          )}
        </div>
      </div>

      {/* Price Display Component */}
      <div className="text-lg font-medium rounded-md text-white/90 flex justify-between items-center mt-4">
        {directListing ? (
          <div className="flex items-center space-x-2">
            <span>{directListing.currencyValuePerToken.displayValue}</span>
            <span>{directListing.currencyValuePerToken.symbol}</span>
          </div>
        ) : auctionListing ? (
          <div className="flex items-center space-x-2">
            <span>{auctionListing.buyoutCurrencyValue.displayValue}</span>
            <span>{auctionListing.buyoutCurrencyValue.symbol}</span>
          </div>
        ) : (
          <span>Not for sale</span>
        )}
        {/* Display USD value if available */}
        {directListing && usdValue && (
          <span className="ml-4">{usdValue}</span>
        )}
      </div>
    </>
  );
}
