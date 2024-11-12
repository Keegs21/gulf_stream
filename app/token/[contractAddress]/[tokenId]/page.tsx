//@ts-nocheck
'use client';

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import TokenDetails from "@/components/token/TokenDetails";
import { NFT_COLLECTION_ADDRESS } from "@/const/contracts";

const TokenPage: React.FC = () => {
  const params = useParams();
  const { tokenAddress, tokenId } = params as { tokenAddress: string; tokenId: string };

  // Access data from the Zustand store using selectors for performance
  const nftData = useMarketplaceStore((state) => state.nftData);
  const loadingListings = useMarketplaceStore((state) => state.loadingListings);
  const loadingAuctions = useMarketplaceStore((state) => state.loadingAuctions);

  // Find the NFT entry matching the tokenAddress and tokenId
  const nftEntry = useMemo(() => {
    return nftData.find(
      (nft) =>
        nft.tokenId === tokenId &&
        nft.nft?.contractAddress?.toLowerCase() === NFT_COLLECTION_ADDRESS.toLowerCase()
    );
  }, [nftData, tokenId]);

  // Handle loading states
  if (loadingListings || loadingAuctions) {
    return <div className="text-center text-white">Loading...</div>;
  }

  // Handle NFT not found
  if (!nftEntry || !nftEntry.nft) {
    return <div className="text-center text-white">NFT not found.</div>;
  }

  return (
    <TokenDetails
      tokenAddress={tokenAddress}
      tokenId={tokenId}
      nftEntry={nftEntry}
    />
  );
};

export default TokenPage;
