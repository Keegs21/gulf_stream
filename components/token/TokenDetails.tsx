//@ts-nocheck
'use client';

import React, { useMemo } from "react";
import { MediaRenderer } from "thirdweb/react";
import { NFTData } from "@/components/NFT/NFTGrid"; // Ensure correct path
import randomColor from "@/util/randomColor";
import BuyListingButton from "@/components/token/BuyListingButton";
import MakeOfferButton from "@/components/token/MakeOfferButton";
import Events from "@/components/token/Events";
import client from "@/lib/client"; // Ensure this is correctly configured
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { REETH_ADDRESS } from "@/const/contracts";

type TokenDetailsProps = {
  tokenAddress: string;
  tokenId: string;
  nftEntry: NFTData;
};

const TokenDetails: React.FC<TokenDetailsProps> = ({ tokenAddress, tokenId, nftEntry }) => {
  const { nft, directListing, auctionListing } = nftEntry;

  const [randomColor1, randomColor2] = [randomColor(), randomColor()];


  const nftprice = directListing?.currencyValuePerToken.displayValue
  const reEthPrice = useMarketplaceStore((state) => state.reEthPrice);
  const lockedTokenPrice = useMarketplaceStore((state) => state.lockedTokenPrice);

const usdPrice = nftprice
    ? parseFloat(nftprice) * (directListing?.currencyContractAddress === REETH_ADDRESS ? reEthPrice ?? 0 : lockedTokenPrice ?? 0)
    : 0;
  const formattedPrice = parseFloat(usdPrice.toString()).toFixed(2);

  // Convert tokenId to bigint for the Events component
  const tokenIdBigInt = useMemo(() => BigInt(tokenId), [tokenId]);

  console.log('nft', nft);

  return (
    <div className="mt-40 p-6">
      <div className="flex flex-col max-w-2xl gap-16 mx-auto lg:max-w-full lg:flex-row bg-gray-700 bg-opacity-40 p-8 rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <img
          src={nft?.metadata.image || '/rwa_image2.png'}
          alt="NFT Image"
          className="object-cover object-center max-w-md mx-auto rounded-lg"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== '/rwa_image2.png') {
              e.target.src = '/rwa_image2.png'; // Set fallback image on error
            }
          }}
        />
        <div className="flex items-center justify-between my-4">
          <div>
            <h1 className="mx-4 text-3xl font-semibold break-words hyphens-auto">
              {nft?.metadata.name}
            </h1>
            <p className="mx-4 overflow-hidden text-ellipsis whitespace-nowrap">
              #{nft?.id.toString()}
            </p>
            <p className="mx-4 overflow-hidden text-ellipsis whitespace-nowrap">
              Locked Tokens {parseFloat(nft?.metadata?.lockedTokenAmount).toFixed(2)}
            </p>
            <p className="mx-4 overflow-hidden text-ellipsis whitespace-nowrap">
              Estimated Value ${parseFloat(nft?.metadata?.assignedValue).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-4 transition-all cursor-pointer hover:opacity-80">
            <div
              className="w-12 h-12 overflow-hidden border-2 rounded-full opacity-90 border-white/20"
              style={{
                background: `linear-gradient(90deg, ${randomColor1}, ${randomColor2})`,
              }}
            />
            {nft?.owner && (
              <div className="flex flex-col">
                <p className="text-white/60">Current Owner</p>
                <p className="font-medium text-white/90">
                  {nft.owner.slice(0, 8)}...
                  {nft.owner.slice(-4)}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="px-4">
          <h3 className="mt-8">History</h3>
          <Events tokenId={tokenIdBigInt} />
        </div>
      </div>

      <div className="flex-shrink sticky w-full min-w-[370px] lg:max-w-[450px]">
        <div className="relative flex flex-col w-full mb-6 overflow-hidden bg-transparent rounded-lg grow">
          {/* Pricing information */}
          <div className="p-4 rounded-lg w-full bg-white/[.04]">
            <p className="mb-1 text-white/60">Price</p>
            <div className="text-lg font-medium rounded-md text-white/90 flex justify-between items-center">
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
                {directListing && formattedPrice && (
                    <span className="ml-4">(~${formattedPrice})</span>
                )}
                </div>
            <div>
              {auctionListing && (
                <>
                  <p
                    className="mb-4 text-white/60"
                    style={{
                      marginTop: 12,
                    }}
                  >
                    Bids starting from
                  </p>

                  <div className="font-medium rounded-md font-lg text-white/90">
                    {auctionListing.minimumBidCurrencyValue.displayValue}{" "}
                    {auctionListing.minimumBidCurrencyValue.symbol}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <BuyListingButton
            directListing={directListing}
            auctionListing={auctionListing}
          />

          {/* <div className="flex justify-center w-full my-4 text-center">
            <p className="text-white/60">or</p>
          </div>
          <MakeOfferButton
            auctionListing={auctionListing}
            directListing={directListing}
            isDisabled={true}
          /> */}
        </div>
      </div>
    </div>
  </div>
  );
};

export default TokenDetails;
