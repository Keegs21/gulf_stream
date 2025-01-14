//@ts-nocheck
"use client";

import React, { useState } from 'react';
import { MediaRenderer } from 'thirdweb/react';
import NFTGrid, { NFTGridLoading } from '@/components/NFT/NFTGrid';
import { NFT as NFTType } from 'thirdweb';
import SaleInfo from '@/components/SaleInfo';
import client from '@/lib/client';
import { useUserStore } from '@/store/useUserStore';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { VERWA_ADDRESS } from "@/const/contracts"; // Import RWA_ADDRESS

export default function Sell() {
  const ownedNFTs = useUserStore((state) => state.ownedNFTs);
  const loading = useUserStore((state) => state.loadingNFTs);
  const account = useUserStore((state) => state.account);
  const loadingListings = useMarketplaceStore((state) => state.loadingListings);
  const [selectedNft, setSelectedNft] = useState<NFTType | null>(null);

  // Map NFT data
  const mappedNftData = ownedNFTs.map(nft => ({
    tokenId: nft.tokenId,
    nft: {
      ...nft,
      id: `${nft.contractAddress}-${nft.tokenId}`,
      contractAddress: nft.contractAddress,
    },
  }));

  // Determine if the selected NFT is an RWA NFT
  const isVerwaNFT = selectedNft?.contractAddress?.toLowerCase() === VERWA_ADDRESS.toLowerCase();

  return (
    <div>
      <h1 className="text-4xl">Your Owned NFTs</h1>
      <div className="my-8">
        {!selectedNft ? (
          <>
            {loading ? (
              <NFTGridLoading />
            ) : (
              <NFTGrid
                nftData={mappedNftData}
                overrideOnclickBehavior={(nft) => {
                  setSelectedNft(nft);
                }}
                emptyText={
                  !account
                    ? 'Connect your wallet to list your NFTs!'
                    : "Looks like you don't own any NFTs in this collection. Head to the buy page to buy some!"
                }
              />
            )}
          </>
        ) : (
          <div className="flex max-w-full gap-8 mt-0 bg-[#5dddff]/10 p-4 rounded-md">
            <div className="flex flex-col w-full">
              <div className="relative">
                {isVerwaNFT ? (
                  <img
                    src="/rwa_image.png" // Ensure this path is correct
                    alt="RWA NFT"
                    className="rounded-lg !w-full !h-auto bg-white/[.04]"
                  />
                ) : selectedNft.metadata?.image ? (
                  <MediaRenderer
                    client={client}
                    src={selectedNft.metadata.image}
                    className="rounded-lg !w-full !h-auto bg-white/[.04]"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-500 text-white text-lg rounded-lg">
                    Image
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedNft(null);
                  }}
                  className="absolute top-0 right-0 m-3 transition-all cursor-pointer hover:scale-110"
                  aria-label="Close NFT Preview"
                >
                  <Cross1Icon className="w-6 h-6 text-black" />
                </button>
              </div>
            </div>

            <div className="relative top-0 w-full max-w-full">
              <h1 className="mb-1 text-3xl font-semibold break-words">
                {selectedNft.metadata?.name || "Unnamed NFT"}
              </h1>
              <p className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                #{selectedNft.id.toString()}
              </p>
              <p className="text-white/60">
                You&rsquo;re about to list the following item for sale.
              </p>

              <div className="relative flex flex-col flex-1 py-4 overflow-hidden bg-transparent rounded-lg">
                <SaleInfo nft={selectedNft} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
