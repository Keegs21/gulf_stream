//@ts-nocheck
"use client";
import React, { useEffect, useMemo, useRef } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { NFT_COLLECTION_ADDRESS, NETWORK, VENFT_API_ADDRESS } from '@/const/contracts';
import { getContract } from 'thirdweb';
import { useUserStore, NFTWithAssignedValue, VoteData } from '@/store/useUserStore';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import client from '@/lib/client';
import { isEqual } from 'lodash';
import { fetchTokenPrices } from '@/lib/fetchEthPrice';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import veNFTAPIAbi from '@/abis/VENFTABI.json'; // Ensure the path is correct
import abi from '@/abis/NFTCOLLECTIONABI.json'; // Ensure the path is correct
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

  // Access Zustand store actions
  const setAccount = useUserStore((state) => state.setAccount);
  const setOwnedNFTs = useUserStore((state) => state.setOwnedNFTs);
  const setLoadingNFTs = useUserStore((state) => state.setLoadingNFTs);
  const setReEthPrice = useUserStore((state) => state.setReEthPrice);
  const setLockedTokenPrice = useUserStore((state) => state.setLockedTokenPrice);
  const setVoteData = useUserStore((state) => state.setVoteData); // New setter

  // Access token prices from Marketplace Store
  const reEthPrice = useMarketplaceStore((state) => state.reEthPrice);
  const lockedTokenPrice = useMarketplaceStore((state) => state.lockedTokenPrice);

  // Memoize the parameters for useReadContract

  const readContractParams = useMemo(() => {
    return {
      contract,
      owner: account?.address || '',
      queryOptions: {
        enabled: !!account?.address,
      },
    };
  }, [contract, account?.address]);

  // Use useReadContract to fetch owned NFTs
  const {
    data: ownedNFTs,
    isLoading: isLoadingNFTs,
    error: errorOwnedNFTs,
  } = useReadContract(getOwnedNFTs, readContractParams);

  // Use useReadContract to fetch vote data
  const {
    data: voteDataRaw,
    isLoading: isLoadingVoteData,
    error: errorVoteData,
  } = useReadContract<any, any>({
    contract: venftContract, // Correct contract instance
    method: 'getNFTFromAddress',
    params: [account?.address || ''],
    queryOptions: {
      enabled: !!account?.address,
    },
  });

  // Refs to store previous values
  const prevAccountRef = useRef<string | undefined>();
  const prevOwnedNFTsRef = useRef<any>();
  const prevVoteDataRef = useRef<any>();

  useEffect(() => {
    const processOwnedNFTs = async () => {
      if (!ownedNFTs || !voteDataRaw) {
        console.warn('processOwnedNFTs: Missing ownedNFTs or voteDataRaw');
        return;
      }
    
      // Extract locked token amounts from each NFT
      const processedNFTs: NFTWithAssignedValue[] = ownedNFTs.map((nft: any, index: number) => {
        let lockedTokenAmount = 0;
    
        // Get corresponding venft data
        const correspondingVenft = voteDataRaw?.venft.find((v: any) => v.id === nft.id);
        if (correspondingVenft) {
          try {
            // Convert the BigInt amount to a human-readable number using token decimals
            const formattedAmount = formatUnits(correspondingVenft.amount.toString(), voteDataRaw.tokenDecimals);
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
        const assignedValue = lockedTokenAmount * lockedTokenPrice;
    
        return {
          ...nft,
          tokenId: nft.id.toString(), // Ensure tokenId is a string
          lockedTokenAmount,
          assignedValue,
          amount, // Add the amount field
        };
      });
    
    
      // Update the store with processed NFTs
      setOwnedNFTs(processedNFTs);
    };
    
    

    const processVoteData = async () => {
      if (!voteDataRaw) return;

      // Assuming voteDataRaw has the structure you provided
      const processedVoteData: VoteData = {
        tokenSymbol: voteDataRaw.tokenSymbol,
        tokenDecimals: Number(voteDataRaw.tokenDecimals),
        voting_amount: BigInt(voteDataRaw.voting_amount).toString(),
        voted: voteDataRaw.voted,
        venft: voteDataRaw.venft.map((v: any) => ({
          id: Number(v.id),
          amount: BigInt(v.amount).toString(),
          rebase_amount: BigInt(v.rebase_amount).toString(),
          lockEnd: Number(v.lockEnd),
          vote_ts: Number(v.vote_ts),
          account: v.account,
          token: v.token,
        })),
        votes: voteDataRaw.votes.map((v: any) => ({
          pair: v.pair,
          weight: v.weight.toString(),
        })),
      };

      // Update the store with processed vote data
      setVoteData(processedVoteData);
    };


    // Update account only if it has changed
    if (prevAccountRef.current !== account?.address) {
      prevAccountRef.current = account?.address;
      setAccount(account?.address);
    }

    // Update loading state for NFTs and vote data
    setLoadingNFTs(isLoadingNFTs || isLoadingVoteData);

    // Handle errors
    if (errorOwnedNFTs) {
      console.error('Error fetching NFTs:', errorOwnedNFTs);
      setOwnedNFTs([]);
    }

    if (errorVoteData) {
      console.error('Error fetching vote data:', errorVoteData);
      setVoteData(null);
    }

    // Process owned NFTs and vote data if available and changed
    if (ownedNFTs && voteDataRaw) {

      if (
        !isEqual(prevOwnedNFTsRef.current, ownedNFTs) ||
        !isEqual(prevVoteDataRef.current, voteDataRaw)
      ) {
        prevOwnedNFTsRef.current = ownedNFTs;
        prevVoteDataRef.current = voteDataRaw;
        processOwnedNFTs();
        processVoteData();
      }
    } else {
      // If no NFTs are owned or no vote data, ensure the store is updated accordingly
      if (prevOwnedNFTsRef.current !== null && !ownedNFTs) {
        prevOwnedNFTsRef.current = null;
        setOwnedNFTs([]);
      }

      if (prevVoteDataRef.current !== null && !voteDataRaw) {
        prevVoteDataRef.current = null;
        setVoteData(null);
      }
    }
  }, [
    account?.address,
    ownedNFTs,
    isLoadingNFTs,
    errorOwnedNFTs,
    voteDataRaw,
    isLoadingVoteData,
    errorVoteData,
    setAccount,
    setOwnedNFTs,
    setLoadingNFTs,
    setVoteData,
    lockedTokenPrice,
  ]);

  return <>{children}</>;
};

export default UserDataProvider;
