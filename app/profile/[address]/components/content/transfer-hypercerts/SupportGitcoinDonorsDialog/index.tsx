"use client";
import {
	Dialog,
	DialogCancel,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/modern-dialog-extended";

import type React from "react";
import { useEffect, useState } from "react";
import Progress from "./progress";

import { Button } from "@/components/ui/button";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import {
	ArrowUpRight,
	ArrowUpRightFromSquare,
	CircleAlert,
} from "lucide-react";

import useGitcoinEcocerts from "@/app/profile/[address]/hooks/use-gitcoin-ecocerts";
import UserChip from "@/components/user-chip";
import Link from "next/link";
import { useWalletClient } from "wagmi";
import Sidebar from "./sidebar";

const ErrorSection = ({
	title,
	description,
	cta,
}: {
	title: string;
	description: string;
	cta: React.ReactNode;
}) => {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg bg-destructive/5 p-4">
			<CircleAlert size={36} className="text-destructive opacity-50" />
			<span className="font-bold font-sans text-lg">{title}</span>
			<p className="mt-1 text-balance text-center text-muted-foreground text-sm">
				{description}
			</p>
			{cta}
		</div>
	);
};

const Skeleton = () => {
	return (
		<div className="flex w-full flex-col gap-1 rounded-lg border border-border p-2.5">
			{Array(4)
				.fill(0)
				.map((_, index) => {
					const key = `donation-skeleton-${index}`;
					return (
						<div
							key={key}
							className="flex w-full items-center justify-between rounded-lg border border-border/20 bg-muted/10 p-2"
						>
							<div className="flex items-center gap-2">
								<div
									className="h-8 w-8 animate-pulse rounded-full bg-muted"
									style={{
										animationDelay: `${0.1 * index}s`,
									}}
								/>
								<div
									className="h-8 w-60 animate-pulse rounded-lg bg-muted"
									style={{
										animationDelay: `${0.4 * index}s`,
									}}
								/>
							</div>
							<div
								className="h-8 w-20 animate-pulse rounded-lg bg-muted"
								style={{
									animationDelay: `${0.8 * index}s`,
								}}
							/>
						</div>
					);
				})}
		</div>
	);
};

const SupportGitcoinDonorsDialog = ({
	ecocertId,
	trigger,
}: {
	ecocertId: string;
	trigger: React.ReactNode;
}) => {
	const [isProgressVisible, setIsProgressVisible] = useState(false);
	const { data: walletClient } = useWalletClient();
	const {
		gitcoinEcocerts,
		isGitcoinEcocertsLoading,
		isRefetchingGitcoinEcocerts,
		refetchGitcoinEcocerts,
	} = useGitcoinEcocerts([ecocertId], `donors-dialog-${ecocertId}`);

	const donations = gitcoinEcocerts?.[0]?.donations ?? [];
	const gitcoinApplicationId = gitcoinEcocerts?.[0]?.applicationId;

	const handleShowDialog = () => {
		refetchGitcoinEcocerts();
		setIsProgressVisible(false);
	};

	return (
		<Dialog
			onOpenChange={(value) => {
				if (value) handleShowDialog();
			}}
		>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent sidebarChildren={<Sidebar />}>
				<DialogHeader>
					<DialogTitle className="font-baskerville">
						Support Gitcoin Donors
					</DialogTitle>
					<DialogDescription className="font-sans text-base">
						Transfer fractions of your ecocert to your donors on Gitcoin.
					</DialogDescription>
				</DialogHeader>
				{donations.length > 0 && isProgressVisible ? (
					<Progress
						gitcoinApplicationId={gitcoinApplicationId ?? ecocertId}
						ecocertId={ecocertId}
						values={donations.map((donation) => ({
							amountInUsd: Number(donation.amount),
							donorAddress: donation.donorAddress,
						}))}
						walletClient={walletClient}
						onCancel={() => setIsProgressVisible(false)}
					/>
				) : (
					<>
						{gitcoinEcocerts !== undefined && gitcoinEcocerts[0] !== null && (
							<div className="flex w-full items-center justify-between rounded-xl border border-border p-1 font-sans shadow-lg">
								<span className="ml-2">
									View the associated project on Gitcoin.
								</span>
								<Link
									href={`https://explorer.gitcoin.co/#/round/42220/35/${gitcoinEcocerts[0].applicationId}`}
									target="_blank"
								>
									<Button
										variant={"outline"}
										size={"sm"}
										className="h-8 w-8 rounded-md p-0"
									>
										<ArrowUpRightFromSquare size={14} />
									</Button>
								</Link>
							</div>
						)}
						{(gitcoinEcocerts === undefined && isGitcoinEcocertsLoading) ||
						isRefetchingGitcoinEcocerts ? (
							<Skeleton />
						) : gitcoinEcocerts === undefined || gitcoinEcocerts[0] === null ? (
							<ErrorSection
								title="No donations found"
								description="No donations found for this ecocert."
								cta={null}
							/>
						) : (
							<div className="max-h-[260px] w-full overflow-y-auto rounded-lg border border-border bg-muted/50 p-2.5">
								<div className="flex w-full flex-col divide-y rounded-lg border border-border bg-background">
									{donations.map((donation) => {
										return (
											<div
												className="flex items-center justify-between p-1"
												key={donation.transactionHash}
											>
												<UserChip
													address={donation.donorAddress as `0x${string}`}
													className="flex-1 rounded-lg bg-transparent"
													showCopyButton="hover"
												/>

												<span className="mr-2 w-[80px] text-right">
													${Number(donation.amountInUsd).toFixed(2)}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</>
				)}
				<DialogFooter>
					<DialogCancel>Close</DialogCancel>
					{!isProgressVisible && (
						<Button
							onClick={() => setIsProgressVisible(true)}
							disabled={donations.length === 0}
						>
							Continue
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default SupportGitcoinDonorsDialog;
