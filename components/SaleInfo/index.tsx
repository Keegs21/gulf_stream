//@ts-nocheck
'use client';

import { NFT as NFTType } from "thirdweb";
import React, { useState, useEffect } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { ADDRESS_ZERO } from "thirdweb";
import { isApprovedForAll } from "thirdweb/extensions/erc721";
import { MARKETPLACE, NFT_COLLECTION, PEARL_ADDRESS, REETH_ADDRESS } from "@/const/contracts"; // Ensure PEARL_ADDRESS is imported
import DirectListingButton from "./DirectListingButton";
import CancelListingButton from "./CancelListingButton";
import cn from "classnames";
import ApprovalButton from "./ApproveButton";
import { DirectListing } from "thirdweb/extensions/marketplace";
import TextField from '@mui/material/TextField';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { FaEthereum, FaGem } from 'react-icons/fa'; // Importing Ethereum and Gem icons from react-icons
import { 
  convertReEthToUsd, 
  convertReEthToUsdNumber, 
  convertPearlToUsd, 
  convertPearlToUsdNumber, 
  calculateSaleRatio 
} from "@/util/priceUtils";

type SaleInfoProps = {
  nft: NFTType;
};

const INPUT_STYLES =
  "block w-full py-3 px-4 pr-28 mb-4 bg-transparent border border-white text-base box-shadow-md rounded-lg"; // Increased pr-28 for more space
const LEGEND_STYLES = "mb-2 text-white/80";

export default function SaleInfo({ nft }: SaleInfoProps) {
  const account = useActiveAccount();
  const [tab, setTab] = useState<"direct" | "auction">("direct");
  const { data: hasApproval } = useReadContract(isApprovedForAll, {
    contract: NFT_COLLECTION,
    owner: account?.address || ADDRESS_ZERO,
    operator: MARKETPLACE.address,
  });
  const [directListingState, setDirectListingState] = useState({
    price: "0",
  });
  // State for end timestamp
  const [endTimestamp, setEndTimestamp] = useState<Date | null>(null);
  // State for currency used for listing
  const [currency, setCurrency] = useState<"reETH" | "PEARL">("reETH");
  // Fetch listings and auctions from the store
  const listings = useMarketplaceStore((state) => state.listings);
  const auctions = useMarketplaceStore((state) => state.auctions);
  // Determine if the NFT is currently listed
  const directListing = listings.find(
    (listing) => listing.tokenId.toString() === nft.tokenId.toString()
  );
  const auctionListing = auctions.find(
    (auction) => auction.tokenId.toString() === nft.tokenId.toString()
  );
  const isListed = !!directListing || !!auctionListing;
  // Fetch reEthPrice and lockedTokenPrice from the store
  const reEthPrice = useMarketplaceStore((state) => state.reEthPrice);
  const lockedTokenPrice = useMarketplaceStore((state) => state.lockedTokenPrice);

  const usdValue = (() => {
    if (directListing) {
      const price = parseFloat(directListing.buyoutPricePerToken);
      const currencyAddress = directListing.currencyContractAddress.toLowerCase();
  
      if (currencyAddress === PEARL_ADDRESS.toLowerCase()) {
        return convertPearlToUsd(price, lockedTokenPrice);
      } else if (currencyAddress === REETH_ADDRESS.toLowerCase()) {
        return convertReEthToUsd(price, reEthPrice);
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
      } else {
        return "Unknown Currency";
      }
    }
    return "0.00";
  })();

  // Compute USD value based on selected currency
  const usdValue2 = (() => {
    const price = parseFloat(directListingState.price);
    if (currency === "reETH") {
      return reEthPrice ? (price * reEthPrice).toFixed(2) : "0.00";
    } else if (currency === "PEARL") {
      return lockedTokenPrice ? (price * lockedTokenPrice).toFixed(2) : "0.00";
    }
    return "0.00";
  })();

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
          {/* Uncomment if auction is enabled
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
        <div
          className={cn(
            tab === "direct" ? "flex" : "hidden",
            "flex-col"
          )}
        >
          {/* Conditional Rendering based on Listing Status */}
          {!isListed ? (
            <>
              {/* Input field for buyout price */}
              <legend className={cn(LEGEND_STYLES)}>
                {currency === "reETH" ? "reETH Listing Price" : "PEARL Listing Price"}
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
                    (${usdValue2})
                  </span>
                )}
              </div>

              {/* Currency Selector */}
              <legend className={cn(LEGEND_STYLES)}>
                Select Currency
              </legend>
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
                  onClick={() => {
                    setCurrency("PEARL");
                      }}
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
              </div>

              {/* Datetime picker for listing duration using MUI */}
              <legend className={cn(LEGEND_STYLES)}>
                Listing Duration
              </legend>
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
                  // Optionally, set a maximum date (e.g., 30 days from now)
                  // maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                />
              </LocalizationProvider>

              {/* Buttons Section */}
              <div className="mt-6 flex flex-col space-y-4">
                {!hasApproval ? (
                  <ApprovalButton />
                ) : (
                  <DirectListingButton
                    nft={nft}
                    pricePerToken={directListingState.price}
                    endTimestamp={endTimestamp || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                    currency={currency === "PEARL" ? PEARL_ADDRESS : undefined} 
                  />
                )}
              </div>
            </>
          ) : (
            // If Listed, show Cancel Listing Button
            <div className="mt-6 flex flex-col space-y-4">
              <CancelListingButton nft={directListing} />
            </div>
          )}
        </div>

        {/* Auction listing fields (if enabled)
        <div
          className={cn(
            tab === "auction" ? "flex" : "hidden",
            "flex-col"
          )}
        >
          <legend className={cn(LEGEND_STYLES)}>
            Allow bids starting from
          </legend>
          <input
            className={cn(INPUT_STYLES)}
            step={0.000001}
            type="number"
            value={auctionListingState.minimumBidAmount}
            onChange={(e) =>
              setAuctionListingState({
                ...auctionListingState,
                minimumBidAmount: e.target.value,
              })
            }
            placeholder="Enter minimum bid amount"
          />

          <legend className={cn(LEGEND_STYLES)}>
            Buyout price
          </legend>
          <input
            className={cn(INPUT_STYLES)}
            type="number"
            step={0.000001}
            value={auctionListingState.buyoutPrice}
            onChange={(e) =>
              setAuctionListingState({
                ...auctionListingState,
                buyoutPrice: e.target.value,
              })
            }
            placeholder="Enter buyout price"
          />

          {!hasApproval ? (
            <ApprovalButton />
          ) : (
            <AuctionListingButton
              nft={nft}
              minimumBidAmount={
                auctionListingState.minimumBidAmount
              }
              buyoutBidAmount={auctionListingState.buyoutPrice}
            />
          )}
        </div>
        */}

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
