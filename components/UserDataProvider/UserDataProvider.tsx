//@ts-nocheck
"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { 
  NFT_COLLECTION_ADDRESS, 
  NETWORK, 
  VENFT_API_ADDRESS, 
  VERWA_ADDRESS // Imported VERWA_ADDRESS
} from '@/const/contracts';
import { getContract } from 'thirdweb';
import { useUserStore, NFTWithAssignedValue, VoteData, VoteDataVerwa } from '@/store/useUserStore';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import client from '@/lib/client';
import { isEqual } from 'lodash';
import { fetchTokenPrices } from '@/lib/fetchEthPrice';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import veNFTAPIAbi from '@/abis/VENFTABI.json'; // Ensure the path is correct
import abi from '@/abis/NFTCOLLECTIONABI.json'; // Ensure the path is correct
import abi2 from '@/abis/VERWAABI.json'; // Ensure the path is correct
import { formatUnits } from 'ethers/lib/utils';

const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const account = useActiveAccount();
  const chain = NETWORK;

  // Memoize the NFT Collection contract instance
  const contract = useMemo(() => {
    return getContract({
      client,
      chain,
      address: NFT_COLLECTION_ADDRESS,
      abi: abi, // Pass the ABI here
    });
  }, [chain]);

  // Memoize the VENFT API contract instance
  const venftContract = useMemo(() => {
    return getContract({
      client,
      chain,
      address: VENFT_API_ADDRESS,
      abi: veNFTAPIAbi, // Pass the ABI here
    });
  }, [chain]);

  // **Added: Memoize the VERWA contract instance**
  const verwaContract = useMemo(() => {
    return getContract({
      client,
      chain,
      address: VERWA_ADDRESS,
      abi: abi2, // Use the correct ABI for VERWA
    });
  }, [chain]);

  // Access Zustand store actions
  const setAccount = useUserStore((state) => state.setAccount);
  const setOwnedNFTs = useUserStore((state) => state.setOwnedNFTs);
  const setLoadingNFTs = useUserStore((state) => state.setLoadingNFTs);
  const setReEthPrice = useUserStore((state) => state.setReEthPrice);
  const setLockedTokenPrice = useUserStore((state) => state.setLockedTokenPrice);
  const setVoteDataVenft = useUserStore((state) => state.setVoteDataVenft); // Updated setter for VENFT
  const setVoteDataVerwa = useUserStore((state) => state.setVoteDataVerwa); // New setter for VERWA

  // Access token prices from Marketplace Store
  const reEthPrice = useMarketplaceStore((state) => state.reEthPrice);
  const lockedTokenPrice = useMarketplaceStore((state) => state.lockedTokenPrice);
  const rwaPrice = useMarketplaceStore((state) => state.rwaPrice);

  // Memoize the parameters for useReadContract for VENFT_API_ADDRESS
  const readContractParamsVenft = useMemo(() => {
    return {
      contract: venftContract,
      method: 'getNFTFromAddress', // Ensure this method exists on VENFT_API_ADDRESS
      params: [account?.address || ''],
      queryOptions: {
        enabled: !!account?.address,
      },
    };
  }, [venftContract, account?.address]);

  // **Added: Memoize the parameters for useReadContract for VERWA_ADDRESS**
  const readContractParamsVerwa = useMemo(() => {
    return {
      contract: verwaContract,
      method: 'getNFTsOfOwnerWithData', // Updated method name for VERWA_ADDRESS
      params: [account?.address || ''],
      queryOptions: {
        enabled: !!account?.address,
      },
    };
  }, [verwaContract, account?.address]);

  // Use useReadContract to fetch owned NFTs from NFT_COLLECTION_ADDRESS
  const {
    data: ownedNFTsCollection,
    isLoading: isLoadingNFTsCollection,
    error: errorOwnedNFTsCollection,
  } = useReadContract(getOwnedNFTs, {
    contract,
    owner: account?.address || '',
    queryOptions: {
      enabled: !!account?.address,
    },
  });

  // **Added: Use useReadContract to fetch owned NFTs from VERWA_ADDRESS**
  const {
    data: ownedNFTsVerwa,
    isLoading: isLoadingNFTsVerwa,
    error: errorOwnedNFTsVerwa,
  } = useReadContract(getOwnedNFTs, {
    contract: verwaContract,
    owner: account?.address || '',
    queryOptions: {
      enabled: !!account?.address,
    },
  });

  // Use useReadContract to fetch vote data from VENFT_API_ADDRESS
  const {
    data: voteDataRawVenft,
    isLoading: isLoadingVoteDataVenft,
    error: errorVoteDataVenft,
  } = useReadContract<any, any>(readContractParamsVenft);

  // **Added: Use useReadContract to fetch vote data from VERWA_ADDRESS**
  const {
    data: voteDataRawVerwa,
    isLoading: isLoadingVoteDataVerwa,
    error: errorVoteDataVerwa,
  } = useReadContract<any, any>(readContractParamsVerwa);

  // Refs to store previous values
  const prevAccountRef = useRef<string | undefined>();
  const prevOwnedNFTsRef = useRef<any>();
  const prevOwnedNFTsVerwaRef = useRef<any>(); // New ref for VERWA
  const prevVoteDataRefVenft = useRef<any>();
  const prevVoteDataRefVerwa = useRef<any>();

  useEffect(() => {
    const processOwnedNFTs = async () => {

      if ((!ownedNFTsCollection && !ownedNFTsVerwa) || (!voteDataRawVenft && !voteDataRawVerwa)) {
        console.warn('processOwnedNFTs: Missing ownedNFTsCollection and ownedNFTsVerwa or vote data');
        return;
      }

      const processedNFTs: NFTWithAssignedValue[] = [];

      // **Process VENFT_API_ADDRESS NFTs**
      if (voteDataRawVenft && ownedNFTsCollection) {
        ownedNFTsCollection.forEach((nft: any) => {
          let lockedTokenAmount = 0;

          // Get corresponding venft data
          const correspondingVenft = voteDataRawVenft?.venft.find((v: any) => v.id === nft.id);
          if (correspondingVenft) {
            try {
              // Convert the BigInt amount to a human-readable number using token decimals
              const formattedAmount = formatUnits(correspondingVenft.amount.toString(), voteDataRawVenft.tokenDecimals);
              lockedTokenAmount = parseFloat(formattedAmount);
            } catch (error) {
              console.error(`Error formatting amount for NFT ID ${nft.id}:`, error);
              lockedTokenAmount = 0;
            }
          } else {
            console.warn(`Warning: No corresponding venft data found for NFT ID: ${nft.id}`);
          }

          // Get the amount from venft data
          let amount = '0';
          if (correspondingVenft && correspondingVenft.amount) {
            try {
              amount = BigInt(correspondingVenft.amount).toString();
            } catch (error) {
              console.error(`Error converting amount for NFT ID ${nft.id}:`, error);
            }
          } else {
            console.warn(`Warning: Amount not found for NFT ID ${nft.id}, defaulting to '0'`);
          }

          // Calculate assigned value
          const assignedValue = lockedTokenAmount * (lockedTokenPrice || 0);

          processedNFTs.push({
            ...nft,
            tokenId: nft.id.toString(), // Ensure tokenId is a string
            lockedTokenAmount,
            assignedValue,
            amount, // Add the amount field
            contractAddress: NFT_COLLECTION_ADDRESS, // Set contractAddress
          });
        });
      }

      // **Process VERWA_ADDRESS NFTs**
      if (voteDataRawVerwa) {
        voteDataRawVerwa.forEach((nft: any) => {
          let lockedTokenAmount = 0;

          try {
            // Convert the BigInt lockedAmount to a human-readable number using token decimals
            const formattedAmount = formatUnits(nft.lockedAmount.toString(), voteDataRawVerwa.tokenDecimals);
            lockedTokenAmount = parseFloat(formattedAmount);
          } catch (error) {
            console.error(`Error formatting lockedAmount for VERWA NFT ID ${nft.tokenId}:`, error);
            lockedTokenAmount = 0;
          }

          // Calculate assigned value
          const assignedValue = lockedTokenAmount * (lockedTokenPrice || 0);

          processedNFTs.push({
            ...nft,
            tokenId: nft.tokenId.toString(), // Ensure tokenId is a string
            lockedTokenAmount,
            assignedValue,
            amount: '0', // VERWA NFTs do not have an 'amount' field
            contractAddress: VERWA_ADDRESS, // Set contractAddress
          });
        });
      }

      // **Set the combined processed NFTs to the store**
      setOwnedNFTs(processedNFTs);
    };

    const processVoteData = async () => {
      // **Process VENFT_API_ADDRESS Vote Data**
      if (voteDataRawVenft) {
        const processedVoteDataVenft: VoteData = {
          tokenSymbol: voteDataRawVenft.tokenSymbol,
          tokenDecimals: Number(voteDataRawVenft.tokenDecimals),
          voting_amount: BigInt(voteDataRawVenft.voting_amount).toString(),
          voted: voteDataRawVenft.voted,
          venft: voteDataRawVenft.venft.map((v: any) => ({
            id: Number(v.id),
            amount: BigInt(v.amount).toString(),
            rebase_amount: BigInt(v.rebase_amount).toString(),
            lockEnd: Number(v.lockEnd),
            vote_ts: Number(v.vote_ts),
            account: v.account,
            token: v.token,
          })),
          votes: voteDataRawVenft.votes.map((v: any) => ({
            pair: v.pair,
            weight: v.weight.toString(),
          })),
        };

        // **Set VENFT_API_ADDRESS Vote Data to the store**
        setVoteDataVenft(processedVoteDataVenft); // Updated to setVoteDataVenft
      }

      // **Added: Process VERWA_ADDRESS Vote Data**
      if (voteDataRawVerwa) {
        const processedVoteDataVerwa: VoteDataVerwa = {
          tokenSymbol: 'VERWA', // Assuming token symbol for VERWA
          tokenDecimals: 18, // Assuming token decimals for VERWA
          voting_amount: '0', // VERWA does not provide voting_amount
          voted: false, // VERWA does not provide voted status
          venft: voteDataRawVerwa.map((v: any) => ({
            id: Number(v.tokenId),
            amount: BigInt(v.lockedAmount).toString(),
            rebase_amount: '0', // VERWA does not provide rebase_amount
            lockEnd: Number(v.remainingDuration),
            vote_ts: 0, // VERWA does not provide vote_ts
            account: account?.address || '',
            token: VERWA_ADDRESS, // Assuming token is VERWA_ADDRESS
          })),
          votes: [], // VERWA does not provide votes data
        };

        // **Set VERWA_ADDRESS Vote Data to the store**
        setVoteDataVerwa(processedVoteDataVerwa); // New setter for VERWA
      }
    };

    // Update account only if it has changed
    if (prevAccountRef.current !== account?.address) {
      prevAccountRef.current = account?.address;
      setAccount(account?.address);
    }

    // Update loading state for NFTs and vote data
    setLoadingNFTs(isLoadingNFTsCollection || isLoadingVoteDataVenft || isLoadingVoteDataVerwa || isLoadingNFTsVerwa); // Include isLoadingNFTsVerwa

    // Handle errors for NFT_COLLECTION_ADDRESS
    if (errorOwnedNFTsCollection) {
      console.error('Error fetching NFTs from collection:', errorOwnedNFTsCollection);
      setOwnedNFTs([]);
    }

    // Handle errors for VERWA_ADDRESS NFT fetch
    if (errorOwnedNFTsVerwa) {
      console.error('Error fetching NFTs from VERWA_ADDRESS:', errorOwnedNFTsVerwa);
      // Optionally handle the error, e.g., setOwnedNFTsVerwa(null);
    }

    // Handle errors for VENFT_API_ADDRESS
    if (errorVoteDataVenft) {
      console.error('Error fetching vote data from VENFT_API:', errorVoteDataVenft);
      // Optionally handle the error, e.g., setVoteDataVenft(null);
    }

    // Handle errors for VERWA_ADDRESS Vote Data
    if (errorVoteDataVerwa) {
      console.error('Error fetching vote data from VERWA:', errorVoteDataVerwa);
      // Optionally handle the error, e.g., setVoteDataVerwa(null);
    }

    // Process owned NFTs and vote data if available and changed
    if ((ownedNFTsCollection || ownedNFTsVerwa) && (voteDataRawVenft || voteDataRawVerwa)) {
      if (
        !isEqual(prevOwnedNFTsRef.current, ownedNFTsCollection) ||
        !isEqual(prevOwnedNFTsVerwaRef.current, ownedNFTsVerwa) ||
        !isEqual(prevVoteDataRefVenft.current, voteDataRawVenft) ||
        !isEqual(prevVoteDataRefVerwa.current, voteDataRawVerwa)
      ) {
        console.log('Detected changes in ownedNFTsCollection, ownedNFTsVerwa, or voteData. Processing data...');
        prevOwnedNFTsRef.current = ownedNFTsCollection;
        prevOwnedNFTsVerwaRef.current = ownedNFTsVerwa;
        prevVoteDataRefVerwa.current = voteDataRawVerwa;
        prevVoteDataRefVenft.current = voteDataRawVenft;
        processOwnedNFTs();
        processVoteData();
      }
    } else {
      // If no NFTs are owned or no vote data, ensure the store is updated accordingly
      if (prevOwnedNFTsRef.current !== null && !ownedNFTsCollection && !ownedNFTsVerwa) {
        console.log('No NFTs owned. Clearing ownedNFTs in the store.');
        prevOwnedNFTsRef.current = null;
        setOwnedNFTs([]);
      }

      if (prevVoteDataRefVenft.current !== null && !voteDataRawVenft) {
        console.log('No VENFT_API_ADDRESS vote data. Clearing voteDataVenft in the store.');
        prevVoteDataRefVenft.current = null;
        setVoteDataVenft(null); // Clear VENFT vote data
      }

      if (prevVoteDataRefVerwa.current !== null && !voteDataRawVerwa) {
        console.log('No VERWA_ADDRESS vote data. Clearing voteDataVerwa in the store.');
        prevVoteDataRefVerwa.current = null;
        setVoteDataVerwa(null); // Clear VERWA vote data
      }
    }
  }, [
    account?.address,
    ownedNFTsCollection,
    isLoadingNFTsCollection,
    errorOwnedNFTsCollection,
    ownedNFTsVerwa, // New dependency
    isLoadingNFTsVerwa, // New dependency
    errorOwnedNFTsVerwa, // New dependency
    voteDataRawVenft,
    isLoadingVoteDataVenft,
    errorVoteDataVenft,
    voteDataRawVerwa,
    isLoadingVoteDataVerwa,
    errorVoteDataVerwa,
    setAccount,
    setOwnedNFTs,
    setLoadingNFTs,
    setVoteDataVenft,
    setVoteDataVerwa,
    lockedTokenPrice,
  ]);

  return <>{children}</>;
};

export default UserDataProvider;
