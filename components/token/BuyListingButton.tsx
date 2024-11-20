//@ts-nocheck
"use client";
import { useState, useEffect } from "react";
import {
  TransactionButton,
  useActiveAccount,
} from "thirdweb/react";
import {
  DirectListing,
  EnglishAuction,
  buyFromListing,
  buyoutAuction,
} from "thirdweb/extensions/marketplace";
import { approve, allowance } from "thirdweb/extensions/erc20";
import { sendTransaction } from "thirdweb";
import { MARKETPLACE, PEARL, RWA, REETH } from "@/const/contracts";
import toastStyle from "@/util/toastConfig";
import toast from "react-hot-toast";

export default function BuyListingButton({
  auctionListing,
  directListing,
}: {
  auctionListing?: EnglishAuction;
  directListing?: DirectListing;
}) {
  const account = useActiveAccount();

  const [hasApproval, setHasApproval] = useState(false);

  useEffect(() => {
    const checkAllowance = async () => {
      if (!account || !directListing) return;

      console.log("Direct listing currency for allowance", directListing.currencyContractAddress);

      // Normalize addresses to lowercase
      const currencyAddress = directListing.currencyContractAddress.toLowerCase();
      const pearlAddress = PEARL.address.toLowerCase();
      const rwaAddress = RWA.address.toLowerCase();
      const reethAddress = REETH.address.toLowerCase();

      // Determine the token contract based on the currencyContractAddress
      let tokenContract;
      if (currencyAddress === pearlAddress) {
        tokenContract = PEARL;
      } else if (currencyAddress === rwaAddress) {
        tokenContract = RWA;
      } else if (currencyAddress === reethAddress || currencyAddress === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        // reETH is the native coin; no allowance needed
        console.log("Currency is reETH (native coin); skipping allowance check.");
        setHasApproval(true); // Skip approval step
        return;
      } else {
        console.error("Unsupported currency contract address");
        return;
      }


      try {
        // Fetch current allowance
        const currentAllowance = await allowance({
          contract: tokenContract,
          owner: account.address,
          spender: MARKETPLACE.address,
        });
        console.log("Current allowance:", currentAllowance.toString());

        // Calculate required amount
        const requiredAmount = BigInt(directListing.pricePerToken) * BigInt(1);
        console.log("Required amount:", requiredAmount.toString());

        // Check if allowance is sufficient
        if (BigInt(currentAllowance.toString()) >= requiredAmount) {
          setHasApproval(true);
        } else {
          setHasApproval(false);
        }
      } catch (error) {
        console.error("Error checking allowance:", error);
      }
    };

    checkAllowance();
  }, [account, directListing]);

  return (
    <>
      {!hasApproval ? (
        <TransactionButton
        transaction={async () => {
          if (!account || !directListing)
            throw new Error("Missing information");
      
          console.log("Approving tokens...");
      
          // Normalize addresses
          const currencyAddress = directListing.currencyContractAddress.toLowerCase();
          const pearlAddress = PEARL.address.toLowerCase();
          const rwaAddress = RWA.address.toLowerCase();
          const reethAddress = REETH.address.toLowerCase();
      
          // Determine the token contract based on the currencyContractAddress
          let tokenContract;
          if (currencyAddress === pearlAddress) {
            tokenContract = PEARL;
          } else if (currencyAddress === rwaAddress) {
            tokenContract = RWA;
          } else if (
            currencyAddress === reethAddress ||
            currencyAddress === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          ) {
            // reETH is the native coin; approval is not required
            console.log("Currency is reETH (native coin); skipping approval.");
            setHasApproval(true);
            return;
          } else {
            throw new Error("Unsupported currency contract address");
          }
      
          const requiredAmount =
            BigInt(directListing.pricePerToken) * BigInt(1);
      
          // Prepare the approval transaction
          const transaction = await approve({
            contract: tokenContract,
            spender: MARKETPLACE.address,
            amount: requiredAmount.toString(),
          });
          console.log("Approval transaction:", transaction);
      
          // Send the approval transaction
          const result = await sendTransaction({ transaction, account });
          console.log("Approval result:", result);
        }}
        onTransactionSent={() => {
          toast.loading("Approving tokens...", {
            id: "approve",
            style: toastStyle,
            position: "bottom-center",
          });
        }}
        onError={(error) => {
          console.log("Approval error:", error);
          toast(`Approval Failed!`, {
            icon: "❌",
            id: "approve",
            style: toastStyle,
            position: "bottom-center",
          });
        }}
        onTransactionConfirmed={(txResult) => {
          console.log("Approval confirmed:", txResult);
          setHasApproval(true);
          toast("Approval Successful!", {
            icon: "✅",
            id: "approve",
            style: toastStyle,
            position: "bottom-center",
          });
        }}
      >
        Approve Tokens
      </TransactionButton>      
      ) : (
        <TransactionButton
          disabled={
            account?.address === auctionListing?.creatorAddress ||
            account?.address === directListing?.creatorAddress ||
            (!directListing && !auctionListing)
          }
          transaction={async () => {
            if (!account) throw new Error("No account");

            if (auctionListing) {
              return buyoutAuction({
                contract: MARKETPLACE,
                auctionId: auctionListing.id,
              });
            } else if (directListing) {
              const buyingParams: any = {
                contract: MARKETPLACE,
                listingId: directListing.id,
                recipient: account.address,
                quantity: BigInt(1),
                currencyContractAddress: directListing.currencyContractAddress,
                totalPrice: directListing.pricePerToken,
              };
              console.log("Buying parameters:", buyingParams);

              return buyFromListing(buyingParams);
            } else {
              throw new Error("No valid listing found for this NFT");
            }
          }}
          onTransactionSent={() => {
            toast.loading("Purchasing...", {
              id: "buy",
              style: toastStyle,
              position: "bottom-center",
            });
          }}
          onError={(error) => {
            console.log("Purchase error:", error);
            toast(`Purchase Failed!`, {
              icon: "❌",
              id: "buy",
              style: toastStyle,
              position: "bottom-center",
            });
          }}
          onTransactionConfirmed={(txResult) => {
            console.log("Purchase confirmed:", txResult);
            toast("Purchased Successfully!", {
              icon: "🥳",
              id: "buy",
              style: toastStyle,
              position: "bottom-center",
            });
          }}
        >
          Buy Now
        </TransactionButton>
      )}
    </>
  );
}
