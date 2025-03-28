"use client";
import CreateListingDialog from "@/app/components/create-listing-dialog";
import UnlistDialog from "@/app/components/unlist-dialog";
import useHypercert from "@/app/contexts/hypercert";
import { Button } from "@/components/ui/button";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { ArrowRight, Trash2 } from "lucide-react";
import React from "react";
import { useAccount } from "wagmi";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CardOptions = () => {
	const hypercert = useHypercert();
	const { address } = useAccount();

	const hasOrderListings =
		hypercert.unitsForSale !== undefined && hypercert.unitsForSale !== 0n;
	const isCreator =
		hypercert.creatorAddress.toLowerCase() === address?.toLowerCase();
	const percentAvailable = calculateBigIntPercentage(
		hypercert.unitsForSale,
		hypercert.totalUnits,
	);

	if (!isCreator) {
		return null;
	}

	return (
		<>
			{hasOrderListings ? (
				<div className="flex items-center justify-between gap-2">
					<div>
						<CircularProgressbar
							className="h-10 w-10"
							styles={buildStyles({
								pathColor: "hsl(var(--primary))",
								textColor: "hsl(var(--foreground))",
								textSize: "26px",
							})}
							text={`${Math.floor(100 - (percentAvailable ?? 0))}%`}
							value={Math.floor(100 - (percentAvailable ?? 0))}
						/>
					</div>
					<UnlistDialog hypercertId={hypercert.hypercertId}>
						<Button variant={"destructive"} className="gap-2">
							<Trash2 size={16} />
							Unlist
						</Button>
					</UnlistDialog>
				</div>
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
