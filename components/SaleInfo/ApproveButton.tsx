// ApprovalButton.tsx
//@ts-nocheck
'use client';

import { TransactionButton } from "thirdweb/react";
import { setApprovalForAll } from "thirdweb/extensions/erc721";
import toast from "react-hot-toast";
import { MARKETPLACE, NFT_COLLECTION, RWA_LISTING, NFT_COLLECTION_ADDRESS, RWALISTING_ADDRESS, VERWA } from "@/const/contracts"; // Ensure MARKETPLACE is imported
import toastStyle from "@/util/toastConfig";

type ApprovalButtonProps = {
  contractAddress: string; // The contract to approve
  label?: string; // Optional label for the button
};

export default function ApprovalButton({ contractAddress, label = "Approve" }: ApprovalButtonProps) {
  // add a check and if contractAddress = NFT_COLLECTION_ADDRESS then set contract to NFT_COLLECTION or if contractAddress = RWALISTING_ADDRESS then set contract to RWA_LISTING
  const contract = contractAddress === NFT_COLLECTION_ADDRESS ? NFT_COLLECTION : RWA_LISTING;
  return (
    <TransactionButton
      transaction={() => {
        return setApprovalForAll({
          contract: contract, // Use the passed contract address
          operator: MARKETPLACE.address,
          approved: true,
        });
      }}
      onTransactionSent={() => {
        toast.loading("Approving...", {
          id: "approve",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onError={(error) => {
        toast(`Approval Failed!`, {
          icon: "❌",
          id: "approve",
          style: toastStyle,
          position: "bottom-center",
        });
        console.error(`Approval error for contract ${contractAddress}:`, error);
      }}
      onTransactionConfirmed={(txResult) => {
        toast("Approval successful.", {
          icon: "👍",
          id: "approve",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
    >
      {label}
    </TransactionButton>
  );
}
