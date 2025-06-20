"use client";
import CreateListingDialog from "@/app/components/create-listing-dialog";
import UnlistDialog from "@/app/components/unlist-dialog";
import useHypercert from "@/app/contexts/hypercert";
import { Button } from "@/components/ui/button";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { ArrowRight, Send, Trash2 } from "lucide-react";
import React from "react";
import { useAccount } from "wagmi";

import TransferDialog from "@/app/components/transfer-dialog";
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

	const { buyerCount, pricePerPercentInUSD } = hypercert;

	if (!isCreator) {
		return null;
	}

	return (
		<>
			{hasOrderListings && pricePerPercentInUSD ? (
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full items-center justify-between rounded-xl bg-accent p-2">
						<div className="flex-1 space-y-1">
							<div className="font-semibold text-sm">
								$
								{Math.floor(
									(100 - (percentAvailable ?? 0)) * pricePerPercentInUSD * 100,
								) / 100}{" "}
								USD raised
							</div>
							<div className="text-muted-foreground text-sm">
								${Math.floor(pricePerPercentInUSD * 100)} target · {buyerCount}{" "}
								buyer{buyerCount !== 1 ? "s" : ""}
							</div>
						</div>
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
					</div>
					<div className="flex items-center gap-1">
						<UnlistDialog hypercertId={hypercert.hypercertId}>
							<Button variant={"secondary"} className="flex-1 gap-2">
								<Trash2 size={16} />
								Unlist
							</Button>
						</UnlistDialog>
						<TransferDialog
							hypercertId={hypercert.hypercertId}
							trigger={
								<Button className="flex-1 gap-2">
									<Send size={16} />
									Transfer
								</Button>
							}
						/>
					</div>
				</div>
			) : (
				<div className="flex flex-1 flex-col">
					<div className="flex-1" />
					<CreateListingDialog
						hypercertId={hypercert.hypercertId}
						trigger={
							<Button className="w-full gap-2">
								List for sale <ArrowRight size={16} />
							</Button>
						}
					/>
				</div>
			)}
		</>
	);
};

export default CardOptions;
