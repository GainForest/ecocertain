"use client";
import GetVerifiedDialog from "@/app/components/get-verified-dialog";
import { Button } from "@/components/ui/button";
import { EvervaultCard } from "@/components/ui/evervault-card";
import UserChip from "@/components/user-chip";
import { verifiedAttestors } from "@/config/gainforest";
import {
	type FullHypercert,
	fetchHypercertIDs,
} from "@/graphql/hypercerts/queries/hypercerts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useAccount } from "wagmi";

const EvaluationDetails = ({ hypercert }: { hypercert: FullHypercert }) => {
	const { attestations } = hypercert;
	const { address } = useAccount();
	const isCreator =
		address?.toLowerCase() === hypercert.creatorAddress.toLowerCase();

	const { data: hyperboardIds, isLoading: hyperboardIdsLoading } = useQuery({
		queryKey: ["hypercert-ids-in-hyperboard"],
		queryFn: fetchHypercertIDs,
	});
	const isVerifiedByGainForest = hyperboardIds?.some(
		(id) => id === hypercert.hypercertId,
	);

	const attesters = new Set(
		attestations.map((attestation) => attestation.attester),
	);
	const [viewingAll, setViewingAll] = useState(false);

	return (
		<div className="group overflow-hidden">
			{/* {isVerifiedByGainForest && (
				<EvervaultCard>
					<div className="flex w-full items-center gap-2">
						<ShieldCheck className="text-primary" size={24} />
						<span className="font-bold text-lg">Verified by Gainforest</span>
					</div>
				</EvervaultCard>
			)} */}
			{attesters.size === 0 && (
				<div className="flex w-full flex-col items-center gap-1 px-8 py-4">
					<span className="text-center text-muted-foreground leading-none">
						{!hyperboardIdsLoading &&
							(isVerifiedByGainForest
								? "This hypercert and its works have been verified by GainForest and is visible on the homepage."
								: "This hypercert is not yet verified by GainForest, and cannot be accessed on the homepage.")}
					</span>
					{isCreator && (
						<Link
							href="https://tally.so/r/w8rRxA"
							target="_blank"
							rel="noreferrer"
							className="mt-2"
						>
							<Button size={"sm"} className="gap-2">
								<ShieldCheck size={16} />
								Get Verified
							</Button>
						</Link>
					)}
				</div>
			)}
			{attesters.size > 0 && (
				<div className={cn("flex w-full flex-col gap-2")}>
					<span className="font-bold text-muted-foreground text-sm">
						Evaluators:
					</span>
					<ul className="flex flex-wrap items-center gap-1">
						{[...attesters]
							.slice(0, viewingAll ? undefined : 3)
							.map((attester) => (
								<UserChip address={attester as `0x${string}`} key={attester} />
							))}
						{attesters.size > 3 && (
							<>
								<li className="flex h-8 items-center justify-center rounded-full border border-border bg-muted px-2 text-sm">
									+{attesters.size - 3}
								</li>
								<Button
									variant={"ghost"}
									size={"sm"}
									onClick={() => setViewingAll(!viewingAll)}
								>
									{viewingAll ? "View less" : "View all"}
								</Button>
							</>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

export default EvaluationDetails;
