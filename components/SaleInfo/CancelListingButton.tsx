//@ts-nocheck
"use client";
import { useRouter } from "next/navigation";
import { NFT as NFTType } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import { cancelListing } from "thirdweb/extensions/marketplace";
import toast from "react-hot-toast";
import { MARKETPLACE, NFT_COLLECTION } from "@/const/contracts";
import toastStyle from "@/util/toastConfig";
import { revalidatePath } from "next/cache";
import { useMarketplaceStore } from "@/store/useMarketplaceStore";

export default function CancelListingButton({
	nft,
}: {
	nft: NFTType;
}) {
    const listings = useMarketplaceStore((state) => state.listings);
	const router = useRouter();

    //compare the nfts in listings with the nft passed in the props
    const listing = listings.find((listing) => {
        return listing.assetContractAddress === NFT_COLLECTION.address &&
            listing.tokenId === nft.tokenId;
    });


	return (
		<TransactionButton
			transaction={() => {
				if (!listing?.id) {
					throw new Error("Listing ID is undefined");
				}
				return cancelListing({
					contract: MARKETPLACE,
					listingId: listing.id,
				});
			}}
			onTransactionSent={() => {
				toast.loading("Listing...", {
					id: "direct",
					style: toastStyle,
					position: "bottom-center",
				});
			}}
			onError={(error) => {
				toast(`Listing Cancel Failed!`, {
					icon: "❌",
					id: "direct",
					style: toastStyle,
					position: "bottom-center",
				});
			}}
			onTransactionConfirmed={(txResult) => {
				toast("Listing Cancelled Successfully!", {
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
			Cancel Listing
		</TransactionButton>
	);
}
