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
import { MARKETPLACE, PEARL, NETWORK } from "@/const/contracts";
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
      if (!account || !PEARL || !directListing) return;
      console.log("Checking PEARL token allowance...");

      try {
        // Fetch current allowance
        const currentAllowance = await allowance({
          contract: PEARL,
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
  }, [account, PEARL, directListing]);

  return (
    <>
      {!hasApproval ? (
        <TransactionButton
          transaction={async () => {
            if (!account || !PEARL || !directListing)
              throw new Error("Missing information");

            console.log("Approving PEARL tokens...");

            const requiredAmount = BigInt(directListing.pricePerToken) * BigInt(1);

            // Prepare the approval transaction
            const transaction = await approve({
              contract: PEARL,
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
        //   onError={(error) => {
        //     console.log("Approval error:", error);
        //     toast(`Approval Failed!`, {
        //       icon: "❌",
        //       id: "approve",
        //       style: toastStyle,
        //       position: "bottom-center",
        //     });
        //   }}
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
