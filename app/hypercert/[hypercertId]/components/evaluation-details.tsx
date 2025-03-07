"use client";
import GetVerifiedDialog from "@/app/components/get-verified-dialog";
import type { FullHypercert } from "@/app/graphql-queries/hypercerts";
import { Button } from "@/components/ui/button";
import { EvervaultCard } from "@/components/ui/evervault-card";
import UserChip from "@/components/user-chip";
import { verifiedAttestors } from "@/config/gainforest";
import { cn } from "@/lib/utils";
import { ArrowRight, ShieldCheck } from "lucide-react";
import React, { useState } from "react";

const EvaluationDetails = ({ hypercert }: { hypercert: FullHypercert }) => {
	const { attestations } = hypercert;
	const attesters = new Set(
		attestations.map((attestation) => attestation.attester),
	);
	const [viewingAll, setViewingAll] = useState(false);

	const hasGainforestAttestation = [...attesters].some((attester) =>
		verifiedAttestors.has(attester),
	);

	return (
		<div className="group overflow-hidden">
			{hasGainforestAttestation && (
				<EvervaultCard>
					<div className="flex w-full items-center gap-2">
						<ShieldCheck className="text-primary" size={24} />
						<span className="font-bold text-lg">Verified by Gainforest</span>
					</div>
				</EvervaultCard>
			)}
			{attesters.size === 0 ? (
				<div className="flex w-full flex-col items-center gap-4 px-8 py-4">
					<span className="text-center text-muted-foreground leading-none">
						This hypercert and the work has not been verified yet.
					</span>
					<GetVerifiedDialog
						hypercertId={hypercert.hypercertId}
						trigger={
							<Button size={"sm"} className="gap-2">
								<ShieldCheck size={16} />
								Get Verified
							</Button>
						}
					/>
				</div>
			) : (
				// Display subtitle if there are no attesters other than gainforest.
				attesters.size === 1 &&
				hasGainforestAttestation && (
					<div className="flex w-full flex-col items-center gap-1 px-8 py-4">
						<span className="text-center text-muted-foreground leading-none">
							This hypercert and the work has been verified by Gainforest.
						</span>
					</div>
				)
			)}
			{attesters.size > 0 && (
				<div
					className={cn(
						"flex w-full flex-col gap-2",
						hasGainforestAttestation ? "mt-4" : "",
					)}
				>
					<span className="font-bold text-muted-foreground text-sm">
						{hasGainforestAttestation ? "Other Evaluators" : "Evaluators"}:
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
