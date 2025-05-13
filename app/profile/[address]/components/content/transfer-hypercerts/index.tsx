"use client";
import useGitcoinEcocerts from "@/app/profile/[address]/hooks/use-gitcoin-ecocerts";
import { ClipboardCheck, HandHeart, TreePalm } from "lucide-react";
import React from "react";
import BatchTransferList from "./BatchTransferList";
const TransferHypercerts = ({
	userHypercertIds,
}: {
	userHypercertIds: string[];
}) => {
	const { gitcoinEcocerts, isGitcoinEcocertsLoading } =
		useGitcoinEcocerts(userHypercertIds);

	const validGitcoinEcocerts = gitcoinEcocerts?.filter(
		(gitcoinEcocert) => gitcoinEcocert !== null,
	);

	if (isGitcoinEcocertsLoading) {
		return (
			<div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-background/20 p-4">
				{new Array(5).fill(0).map((_, index) => {
					const key = `gitcoin-ecocert-skeleton-item-${index}`;
					return (
						<div className="flex items-center justify-between py-2" key={key}>
							<div className="flex items-center gap-2">
								<div
									className="h-10 w-10 animate-pulse rounded-full bg-beige-muted"
									style={{
										animationDelay: `${index * 300}ms`,
									}}
								/>
								<div
									className="h-8 w-24 animate-pulse rounded-md bg-beige-muted"
									style={{
										animationDelay: `${index * 700}ms`,
									}}
								/>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="h-8 w-12 animate-pulse rounded-md bg-beige-muted"
									style={{
										animationDelay: `${index * 1200}ms`,
									}}
								/>

								<div
									className="h-8 w-20 animate-pulse rounded-md bg-beige-muted"
									style={{
										animationDelay: `${index * 1400}ms`,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	if (validGitcoinEcocerts === undefined || validGitcoinEcocerts?.length === 0)
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
			<BatchTransferList gitcoinEcocerts={validGitcoinEcocerts} />;
		</div>
	);
};

export default TransferHypercerts;
