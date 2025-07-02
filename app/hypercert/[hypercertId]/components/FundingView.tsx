"use client";

import CreateListingDialog from "@/app/components/create-listing-dialog";
import Progress from "@/app/components/shared/progress";
import useFullHypercert from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { formatDecimals } from "@/lib/utils";
import { ArrowRight, BadgeDollarSign, CircleAlert, Clock } from "lucide-react";
import React from "react";
import { useAccount } from "wagmi";
import PaymentFlow from "./PaymentFlow";
const OpenVariant = ({ reached, goal }: { reached: number; goal: number }) => {
	return (
		<div className="flex h-full w-full flex-col justify-between">
			<div className="flex w-full flex-col">
				<div className="relative z-[5] flex items-center justify-between">
					<div className="flex flex-col items-start">
						<span className="text-balance text-center text-muted-foreground">
							Reached
						</span>
						<span className="font-bold text-xl">${reached}</span>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-balance text-center text-muted-foreground">
							Goal
						</span>
						<span className="font-bold text-xl">${goal}</span>
					</div>
				</div>
				<Progress
					percentage={(reached * 100) / goal}
					className="mt-2 bg-beige-muted"
				/>
			</div>
			<div className="mt-4 flex items-center justify-end">
				<PaymentFlow>
					<Button className="gap-2" size={"sm"}>
						Buy <ArrowRight size={16} />
					</Button>
				</PaymentFlow>
			</div>
		</div>
	);
};

const ComingVariant = () => {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-2">
			<div className="flex flex-col items-center justify-center gap-2 text-beige-muted-foreground">
				<Clock size={40} />
				<span className="font-bold text-xl">
					This hypercert is not listed for sale.
				</span>
			</div>
			<span className="text-balance text-center text-muted-foreground">
				Stay tuned for updates.
			</span>
		</div>
	);
};

const ListingOptionVariant = () => {
	const hypercert = useFullHypercert();
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-2">
			<div className="flex flex-col items-center justify-center gap-2 text-beige-muted-foreground">
				<BadgeDollarSign size={40} />
				<span className="font-bold text-xl">Need donations?</span>
			</div>
			<span className="text-balance text-center text-muted-foreground">
				List for sale to get donations.
			</span>
			<CreateListingDialog
				hypercertId={hypercert.hypercertId}
				trigger={
					<Button className="gap-2" size={"sm"}>
						<span>List for sale</span>
						<ArrowRight size={16} />
					</Button>
				}
			/>
		</div>
	);
};

const SoldVariant = () => {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-2">
			<div className="flex flex-col items-center justify-center gap-2 text-destructive">
				<CircleAlert size={40} />
				<span className="font-bold text-xl">Sold Out</span>
			</div>
			<span className="text-balance text-center text-muted-foreground">
				This hypercert is no longer for sale.
			</span>
		</div>
	);
};

const VariantSelector = () => {
	const hypercert = useFullHypercert();
	const {
		totalUnits,
		unitsForSale,
		cheapestOrder: { pricePerPercentInUSD },
	} = hypercert;
	const { address } = useAccount();
	if (pricePerPercentInUSD === undefined) {
		if (hypercert.creatorAddress.toLowerCase() === address?.toLowerCase()) {
			return <ListingOptionVariant />;
		}
		return <ComingVariant />;
	}
	if (unitsForSale === 0n) return <SoldVariant />;
	const unitsSold = totalUnits - unitsForSale;
	const percentCompleted = calculateBigIntPercentage(unitsSold, totalUnits);
	if (percentCompleted === undefined) return <SoldVariant />;
	return (
		<OpenVariant
			reached={formatDecimals(percentCompleted * pricePerPercentInUSD)}
			goal={formatDecimals(100 * pricePerPercentInUSD)}
		/>
	);
};

const FundingView = () => {
	return (
		<div className="relative min-h-40 w-full max-w-full overflow-hidden rounded-xl border border-border bg-background/50 p-4 md:w-auto md:max-w-md md:flex-1 md:basis-full">
			<VariantSelector />
		</div>
	);
};

export default FundingView;
