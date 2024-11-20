//@ts-nocheck
'use client';

import React, { useContext, useEffect, useMemo } from "react";
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import NFTGrid from "../NFT/NFTGrid";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import { MarketplaceDataContext } from '@/components/MarketplaceProvider/MarketplaceProvider'; // Adjust the import path

type Props = {
  overrideOnclickBehavior?: (nft: any) => void;
  emptyText: string;
};

const ListingGridComponent: React.FC<Props> = ({ overrideOnclickBehavior, emptyText }) => {
  const { nftData, loadingListings, listings } = useMarketplaceStore();

  const marketplaceDataContext = useContext(MarketplaceDataContext);

  console.log('listings', listings);

  useEffect(() => {
    if (nftData.length > 0 && marketplaceDataContext?.fetchVoteData) {
      marketplaceDataContext.fetchVoteData();
    }
  }, [nftData, marketplaceDataContext?.fetchVoteData]);


  // Memoize the convertedNftData
  const convertedNftData = useMemo(() => {
    return nftData.map(nft => ({
      ...nft,
      tokenId: nft.tokenId.toString()
    }));
  }, [nftData]);

  console.log('convertedNftData', convertedNftData);

  if (loadingListings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  if (convertedNftData.length === 0) {
    return (
      <Container>
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mt: 4 }}>
          {emptyText}
        </Typography>
      </Container>
    );
  }

  return (
      <NFTGrid
        nftData={convertedNftData}
        emptyText={emptyText}
        overrideOnclickBehavior={overrideOnclickBehavior}
      />
  );
};

// Wrap the component with React.memo
const ListingGrid = React.memo(ListingGridComponent);

// Assign a display name to the memoized component
ListingGrid.displayName = "ListingGrid";

export default ListingGrid;
