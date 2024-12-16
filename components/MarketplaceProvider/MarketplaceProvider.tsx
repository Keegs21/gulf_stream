//@ts-nocheck
'use client';
// src/components/MarketplaceDataProvider.tsx

import React, { useEffect, useMemo, useRef, createContext, useCallback, useState } from 'react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import {
  MARKETPLACE,
  NETWORK,
  NFT_COLLECTION,
  VENFT_API_ADDRESS,
  RWA_LISTING,
  VERWA,
  VERWA_ADDRESS,
  RWALISTING_ADDRESS,
} from '@/const/contracts';
import {
  DirectListing,
  getAllValidListings,
} from 'thirdweb/extensions/marketplace';
import { getNFT } from 'thirdweb/extensions/erc721';
import isEqual from 'lodash/isEqual';
import { fetchTokenPrices } from '@/lib/fetchEthPrice'; // Updated import path to include rwa
import { useActiveAccount } from 'thirdweb/react';
import { formatUnits } from 'ethers/lib/utils';
import veNFTAPIAbi from '@/abis/VENFTABI.json'; // Ensure the path is correct
import veRWAabi from '@/abis/VERWAABI.json'; // Ensure the path is correct
import client from '@/lib/client';
import { getContract, readContract, getContractEvents, prepareEvent } from 'thirdweb';
import { ethers } from 'ethers';

interface veNFT {
  id: bigint;
  amount: bigint;
  rebase_amount: bigint;
  lockEnd: bigint;
  vote_ts: bigint;
  account: string;
  token: string;
}

type NFTData = {
  tokenId: string;
  nft?: {
    contractAddress: string | undefined;
    id: string | number;
    metadata: {
      name?: string;
      image?: string;
      lockedTokenAmount?: number;
      assignedValue?: number;
      [key: string]: any;
    };
    owner?: string;
  };
  directListing?: DirectListing;
  auctionListing?: any;
  events?: any[]; // Define a proper type based on your events structure
};

interface MarketplaceDataContextValue {
  fetchVoteData: () => Promise<void>;
}

export const MarketplaceDataContext = createContext<{ fetchVoteData?: () => void }>({});

const MarketplaceDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const chain = NETWORK;
  const account = useActiveAccount();

  // Memoize the VENFT API contract instance
  const venftContract = useMemo(() => {
    return getContract({
      client,
      chain,
      address: VENFT_API_ADDRESS,
      abi: veNFTAPIAbi, // Pass the ABI here
    });
  }, [chain]);

  const verwaContract = useMemo(() => {
    return getContract({
      client,
      chain,
      address: VERWA_ADDRESS,
      abi: veRWAabi, // Pass the ABI here
    });
  }, [chain]);


  const {
    setListings,
    setAuctions,
    setNftData,
    setReEthPrice,
    setTotalVolume, // New setter
    setLockedTokenPrice,
    setRwaPrice,
    setUsdcPrice,
    setLoadingListings,
    setLoadingAuctions,
    lockedTokenPrice,
    rwaPrice,
    nftData,
    totalVolume,
  } = useMarketplaceStore();

  // **Added: Ref to track previous rwaPrice**
  const prevRwaPriceRef = useRef<number | null>(null);

  const parseLockedTokenAmount = (voteDataRaw: veNFT | bigint | any): number => {
    try {
      let amount: bigint;
  
      if (typeof voteDataRaw === 'bigint') {
        // Directly received a BigInt
        amount = voteDataRaw;
      } else if (typeof voteDataRaw === 'object' && voteDataRaw !== null) {
        if ('amount' in voteDataRaw) {
          amount = BigInt(voteDataRaw.amount);
        } else {
          console.warn('voteDataRaw object does not have an "amount" field:', voteDataRaw);
          return 0;
        }
      } else {
        console.warn('voteDataRaw is neither a bigint nor a valid object:', voteDataRaw);
        return 0;
      }
  
      // Since 'decimals' isn't part of the veNFT struct, default to 18
      const decimals = 18;
  
      // Convert the amount to a human-readable number using ethers.js formatUnits
      const formattedAmount = parseFloat(formatUnits(amount, decimals));
      return formattedAmount;
    } catch (error) {
      console.error('Error parsing locked token amount:', error);
      return 0;
    }
  };  

  // Refs to store previous values to prevent unnecessary state updates
  const prevListingsRef = useRef<DirectListing[] | null>(null);
  const prevReEthPriceRef = useRef<number | null>(null);
  const prevLockedTokenPriceRef = useRef<number | null>(null);
  const prevUsdcPriceRef = useRef<number | null>(null); // Track previous USDC price


  let isMounted = true; // To prevent setting state on unmounted component

  /**
   * Helper function to handle retries with exponential backoff
   */
  const fetchWithRetry = async (
    fn: () => Promise<any>,
    retries = 3,
    delay = 1000
  ) => {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && error?.response?.status === 429) {
        console.warn(`Rate limited. Retrying after ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        return fetchWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
      }
      throw error;
    }
  };

  /**
   * Helper function to process NFT fetches in batches with concurrency control
   */
  const fetchNFTsInBatches = async (
    tokenIds: string[],
    batchSize: number = 5
  ): Promise<NFTData[]> => {
    const results: NFTData[] = [];
    for (let i = 0; i < tokenIds.length; i += batchSize) {
      const batch = tokenIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (tokenId) => {
        try {
          const nft = await fetchWithRetry(() =>
            getNFT({
              contract: NFT_COLLECTION,
              tokenId: BigInt(tokenId),
              includeOwner: false, // Adjust based on your needs
            })
          );

          // Explicitly define the nft object to avoid dynamic properties
          const formattedNft = {
            contractAddress: NFT_COLLECTION.address,
            id: nft.id.toString(), // Convert id to string
            metadata: {
              name: nft.metadata.name,
              image: nft.metadata.image,
              description: nft.metadata.description,
              // Include other metadata fields if necessary
            },
            owner: nft.owner || undefined, // Convert null to undefined
          };

          return {
            tokenId,
            nft: formattedNft,
          };
        } catch (error) {
          console.error(`Error fetching NFT data for tokenId ${tokenId}:`, error);
          return { tokenId, nft: undefined };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    return results;
  };

  const fetchData = async () => {
    setLoadingListings(true);
    setLoadingAuctions(true);
    try {
      // Fetch all valid direct listings with retry
      const listings: DirectListing[] = await fetchWithRetry(() =>
        getAllValidListings({
          contract: MARKETPLACE,
        })
      );


      if (!isMounted) return;

      // Update the store with fetched listings only if they have changed
      if (!isEqual(prevListingsRef.current, listings)) {
        prevListingsRef.current = listings;
        const sanitizedListings = listings.map(listing => ({
          ...listing,
          startTime: listing.startTimeInSeconds,
          endTime: listing.endTimeInSeconds,
          buyoutPricePerToken: listing.currencyValuePerToken.displayValue || '0',
          sellerAddress: listing.creatorAddress || '',
          currencyContractAddress: listing.currencyContractAddress || '',
        }));
        setListings(sanitizedListings);
      } else {
      }

      // Extract unique tokenIds from listings
      const tokenIds = Array.from(
        new Set(
          listings
            .filter(
              (l) =>
                l.assetContractAddress.toLowerCase() === NFT_COLLECTION.address.toLowerCase() ||
                l.assetContractAddress.toLowerCase() === RWA_LISTING.address.toLowerCase()
            )
            .map((l) => l.tokenId.toString())
        )
      ).sort(); // Sort to ensure consistent order


      // Fetch NFT metadata in batches with concurrency control
      const nftResults = await fetchNFTsInBatches(tokenIds, 5);

      if (!isMounted) return;

      // Combine listings with NFT metadata
      const combinedNftData: NFTData[] = nftResults.map(({ tokenId, nft }) => ({
        tokenId,
        nft,
        directListing: listings.find((listing) => listing.tokenId.toString() === tokenId),
      }));


      // Update the store with the new combinedNftData
      setNftData(combinedNftData);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      // Only set empty arrays if data has actually changed
      if (prevListingsRef.current?.length !== 0) {
        prevListingsRef.current = [];
        setListings([]);
      }
      if (prevNftDataRef.current?.length !== 0) {
        prevNftDataRef.current = [];
        setNftData([]);
      }
    } finally {
      setLoadingListings(false);
      setLoadingAuctions(false);
    }
  };

  /**
   * Fetch and set reETH, lockedToken, and rwa prices
   */
  const fetchAndSetPrices = async () => {
    try {
      const prices = await fetchTokenPrices();
      if (isMounted) {
        // reETH price
        if (!isEqual(prevReEthPriceRef.current, prices.reETH)) {
          prevReEthPriceRef.current = prices.reETH;
          setReEthPrice(prices.reETH);
        }

        // lockedToken price
        if (!isEqual(prevLockedTokenPriceRef.current, prices.lockedToken)) {
          prevLockedTokenPriceRef.current = prices.lockedToken;
          setLockedTokenPrice(prices.lockedToken);
        }

        // RWA price
        if (!isEqual(prevRwaPriceRef.current, prices.rwa)) {
          prevRwaPriceRef.current = prices.rwa;
          setRwaPrice(prices.rwa);
        }

        // USDC price (extracted from the coingecko "uni" response previously)
        // Assuming we have `prices.usdc` from fetchTokenPrices (adjust if necessary)
        if (prices.usdc !== undefined && !isEqual(prevUsdcPriceRef.current, prices.usdc)) {
          prevUsdcPriceRef.current = prices.usdc;
          setUsdcPrice(prices.usdc);
        }
      }
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }
  };

  // New function to fetch vote data using SDK calls
  const fetchVoteData = useCallback(async () => {
    if (!nftData || nftData.length === 0) {
      console.warn('No nftData available to fetch vote data.');
      return;
    }

    try {
      const updatedNftData = await Promise.all(
        nftData.map(async (nftDataItem) => {
          try {
            // Determine NFT type based on contractAddress
            const nftContractAddress = nftDataItem.directListing?.assetContractAddress.toLowerCase();
            const isVerwaNFT =
              nftContractAddress === VERWA.address.toLowerCase() ||
              nftContractAddress === RWA_LISTING.address.toLowerCase();

            // Initialize variables
            let voteDataRaw: veNFT | any = null;
            let unlockDataRaw: any = null;
            let unlockData: string | null = null; // Declare unlockData outside the if-else

            if (isVerwaNFT) {
              // Fetch vote data from VERWA contract for RWA NFTs
              voteDataRaw = await readContract({
                contract: verwaContract,
                method: 'getLockedAmount',
                params: [BigInt(nftDataItem.tokenId)],
              });

              unlockDataRaw = await readContract({
                contract: verwaContract,
                method: 'getRemainingVestingDuration',
                params: [BigInt(nftDataItem.tokenId)],
              });

              // Convert remaining vesting duration to a future date
              if (unlockDataRaw && typeof unlockDataRaw === 'bigint') {
                const durationSeconds = Number(unlockDataRaw);
                if (!isNaN(durationSeconds) && durationSeconds > 0) {
                  unlockData = new Date(Date.now() + durationSeconds * 1000).toLocaleString('en-US', {
                    timeZone: 'UTC',
                  });
                } else {
                  console.warn('Invalid remaining vesting duration:', unlockDataRaw);
                  unlockData = null;
                }
              }
            } else {
              // Fetch vote data from VENFT_API_ADDRESS contract for Pearl NFTs
              voteDataRaw = await readContract({
                contract: venftContract,
                method: 'getNFTFromId',
                params: [BigInt(nftDataItem.tokenId)],
              });

              unlockDataRaw = voteDataRaw.lockEnd;

              // Convert lockEnd UNIX timestamp to a human-readable date
              if (unlockDataRaw && typeof unlockDataRaw === 'bigint') {
                const lockEndTimestamp = Number(unlockDataRaw);
                if (!isNaN(lockEndTimestamp) && lockEndTimestamp > 0) {
                  unlockData = new Date(lockEndTimestamp * 1000).toLocaleString('en-US', {
                    timeZone: 'UTC',
                  });
                } else {
                  console.warn('Invalid lockEnd timestamp:', unlockDataRaw);
                  unlockData = null;
                }
              }
            }

            // Check if voteDataRaw is valid
            if (!voteDataRaw) {
              console.warn(`No data returned for tokenId ${nftDataItem.tokenId}`);
              return nftDataItem;
            }

            // Parse lockedTokenAmount and assignedValue
            const lockedTokenAmount = parseLockedTokenAmount(voteDataRaw);

            // Determine the token price based on NFT type
            const tokenPrice = isVerwaNFT ? (rwaPrice || 0) : (lockedTokenPrice || 0);

            // Calculate the assigned value
            const assignedValue = lockedTokenAmount * tokenPrice;

            return {
              ...nftDataItem,
              nft: {
                ...nftDataItem.nft,
                metadata: {
                  ...nftDataItem.nft?.metadata,
                  lockedTokenAmount,
                  assignedValue,
                  unlockData, // Properly include unlockData here
                },
              },
            };
          } catch (error: any) {
            console.error(`Error fetching vote data for tokenId ${nftDataItem.tokenId}:`, error);
            return nftDataItem;
          }
        })
      );

      // Update the store with the updated nftData
      setNftData(updatedNftData);
    } catch (error: any) {
      console.error('Error in fetchVoteData:', error);
    }
  }, [
    nftData,
    setNftData,
    lockedTokenPrice,
    rwaPrice, // Ensure rwaPrice is included in dependencies if used
    venftContract,
    verwaContract,
  ]);


  const fetchTotalVolume = async () => {
    try {
      // Correctly prepare the NewSale event with all parameters
      const newSaleEvent = prepareEvent({
        signature: "event NewSale(address indexed listingCreator, uint256 indexed listingId, address indexed assetContract, uint256 tokenId, address buyer, uint256 quantityBought, uint256 totalPricePaid)",
      });
  
      // Fetch the NewSale events from the marketplace contract
      const events = await getContractEvents({
        contract: MARKETPLACE,
        events: [newSaleEvent], // Ensure this is an array if multiple events are fetched
        fromBlock: BigInt(1040854), // Consider updating to the deployment block for efficiency
        toBlock: 'latest',
      });
    
      // Calculate the total volume using BigNumber for precision
      const totalVolume = events.reduce((total, event) => {
        const totalPricePaid = ethers.BigNumber.from(event.args.totalPricePaid);
        return total.add(totalPricePaid);
      }, ethers.BigNumber.from(0));
    
      setTotalVolume(parseFloat(ethers.utils.formatUnits(totalVolume, 18)));
    } catch (error) {
      console.error('Error fetching total volume:', error);
    }
  };
  

  useEffect(() => {
    isMounted = true; // To prevent setting state on unmounted component

    // Initial data fetch
    fetchData();

    // Fetch prices on mount
    fetchAndSetPrices(); // **Updated: Fetch and set all prices including rwa**

    // Fetch total volume
    fetchTotalVolume();

    // Set up interval to fetch prices every 60 seconds
    const priceInterval = setInterval(() => {
      fetchAndSetPrices(); // **Updated: Periodically fetch and set all prices**
    }, 60000); // 60,000 ms = 60 seconds

    return () => {
      isMounted = false;
      clearInterval(priceInterval); // **Updated: Clear the interval**
    };
  }, [
    setListings,
    setAuctions,
    setNftData,
    setReEthPrice,
    setLockedTokenPrice,
    setRwaPrice,
    setUsdcPrice,
    setLoadingListings,
    setLoadingAuctions,
  ]);

  return (
    <MarketplaceDataContext.Provider value={{ fetchVoteData }}>
      {children}
    </MarketplaceDataContext.Provider>
  );
};

export default MarketplaceDataProvider;
