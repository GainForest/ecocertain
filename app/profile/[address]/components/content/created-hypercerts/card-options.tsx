"use client";
import CreateListingDialog from "@/app/components/create-listing-dialog";
import useHypercert from "@/app/contexts/hypercert";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useAccount } from "wagmi";
const CardOptions = () => {
	const hypercert = useHypercert();
	const { address } = useAccount();
	console.log(hypercert.name, hypercert.unitsForSale);
	const hasOrderListings =
		hypercert.unitsForSale !== undefined && hypercert.unitsForSale !== 0n;
	const isCreator =
		hypercert.creatorAddress.toLowerCase() === address?.toLowerCase();

	if (!isCreator) {
		return null;
	}

	return (
		<>
			{hasOrderListings ? (
				<Button variant={"secondary"} className="w-full gap-2" disabled>
					Already Listed
				</Button>
			) : (
				<CreateListingDialog
					hypercertId={hypercert.hypercertId}
					trigger={
						<Button className="w-full gap-2">
							List for sale <ArrowRight size={16} />
						</Button>
					}
				/>
			)}
		</>
	);
};

export default CardOptions;
