//@ts-nocheck
'use client';
import { useRouter } from "next/navigation";
import { NFT as NFTType } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import { createListing } from "thirdweb/extensions/marketplace";
import toast from "react-hot-toast";
import { MARKETPLACE, NFT_COLLECTION, PEARL_ADDRESS, VERWA_ADDRESS, RWALISTING_ADDRESS } from "@/const/contracts"; // Ensure PEARL_ADDRESS is imported
import toastStyle from "@/util/toastConfig";
import { revalidatePath } from "next/cache";

export default function DirectListingButton({
  nft,
  pricePerToken,
  endTimestamp,
  currency,
}: {
  nft: NFTType;
  pricePerToken: string;
  endTimestamp: Date;
  currency?: string;
}) {
  const router = useRouter();

  const assetContractAddress =
    nft.contractAddress.toLowerCase() === VERWA_ADDRESS.toLowerCase()
      ? RWALISTING_ADDRESS
      : nft.contractAddress;

  return (
    <TransactionButton
      transaction={() => {
        const listingParams: any = {
          contract: MARKETPLACE,
          assetContractAddress: assetContractAddress,
          tokenId: nft.tokenId,
          pricePerToken,
          endTimestamp,
        };

        if (currency) {
          listingParams.currencyContractAddress = currency;
        }

        return createListing(listingParams);
      }}
      onTransactionSent={() => {
        toast.loading("Listing...", {
          id: "direct",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onError={(error) => {
        toast(`Listing Failed!`, {
          icon: "❌",
          id: "direct",
          style: toastStyle,
          position: "bottom-center",
        });
        console.log("Error listing", error);
      }}
      onTransactionConfirmed={(txResult) => {
        toast("Listed Successfully!", {
          icon: "🥳",
          id: "direct",
          style: toastStyle,
          position: "bottom-center",
        });
        router.push(
          `/token/${NFT_COLLECTION.address}/${nft.id.toString()}`
        );
      }}
    >
      List for Sale
    </TransactionButton>
  );
}
