"use client";
import useGitcoinData from "@/app/profile/[address]/components/content/gitcoin-donations/hooks/use-gitcoin-data";
import { ClipboardCheck, HandHeart, TreePalm } from "lucide-react";
import React from "react";
import BatchTransferList from "./BatchTransferList";
const GitcoinDonations = ({
	userHypercertIds,
}: {
	userHypercertIds: string[];
}) => {
	const gitcoinDataArray = useGitcoinData(userHypercertIds);

	if (gitcoinDataArray.filter((data) => data !== null).length === 0)
		return (
			<div className="flex w-full flex-col items-center text-balance rounded-xl border border-border bg-background p-4 text-center">
				<TreePalm className="text-muted-foreground opacity-50" size={60} />
				<h1 className="mt-2 font-bold text-xl">Touch some grass!</h1>
				<p className="font-sans text-muted-foreground">
					You do not have any ecocerts listed on Gitcoin Grants Round 35.
				</p>
			</div>
		);

	return (
		<div className="w-full">
			<div className="mb-4 flex items-center gap-3 px-1">
				<HandHeart className="text-muted-foreground opacity-80" size={26} />
				<div className="flex flex-col">
					<span className="font-sans font-semibold">
						Gitcoin Grants Round 35
					</span>
					<span className="font-sans text-beige-muted-foreground text-sm">
						Support your donors by offering them fractions to the hypercert.
					</span>
				</div>
			</div>
			<BatchTransferList
				gitcoinDataArray={gitcoinDataArray.filter((data) => data !== null)}
			/>
			;
		</div>
	);
};

export default GitcoinDonations;
