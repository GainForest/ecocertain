"use client";
import GetVerifiedDialog from "@/app/components/get-verified-dialog";
import useFullHypercert from "@/app/contexts/full-hypercert";
import { verifiedAttestors } from "@/config/gainforest";
import { fetchHypercertIDs } from "@/graphql/hypercerts/queries/hypercerts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import React from "react";
import { useAccount } from "wagmi";

const VerificationIndicator = () => {
	const { address } = useAccount();
	const hypercert = useFullHypercert();
	const { data: hyperboardIds, isLoading: hyperboardIdsLoading } = useQuery({
		queryKey: ["hypercert-ids-in-hyperboard"],
		queryFn: fetchHypercertIDs,
	});

	const isVerified = hyperboardIds?.some((id) => id === hypercert.hypercertId);

	const isCreator =
		hypercert.creatorAddress.toLowerCase() === address?.toLowerCase();

	if (hyperboardIdsLoading) return null;

	return (
		<div
			className={cn(
				"w-full px-3 py-1 font-sans text-sm",
				isVerified
					? "bg-green-500/10 text-green-800 dark:text-green-300"
					: "bg-red-500/10 text-red-800 dark:text-red-300",
			)}
		>
			{isVerified ? (
				<div className="flex w-full items-center justify-center gap-1 text-center">
					<ShieldCheck size={16} className="opacity-50" />
					<span>This ecocert is verified.</span>
				</div>
			) : isCreator ? (
				<div className="flex w-full items-center justify-between">
					<span className="flex items-center gap-1">
						<ShieldAlert size={16} className="opacity-50" />
						<span>This ecocert is not listed on the homepage.</span>
					</span>
					<a href="https://tally.so/r/w8rRxA" target="_blank" rel="noreferrer">
						<button
							className="flex items-center justify-center gap-1 focus:underline hover:underline"
							type="button"
						>
							Apply for listing <ArrowRight size={16} />
						</button>
					</a>
				</div>
			) : (
				<div className="flex w-full items-center justify-center gap-1 text-center">
					<ShieldAlert size={16} className="opacity-50" />
					<span>This ecocert is not listed on the homepage.</span>
				</div>
			)}
		</div>
	);
};

export default VerificationIndicator;
