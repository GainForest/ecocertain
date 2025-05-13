"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EthAvatar from "@/components/ui/eth-avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useCopy from "@/hooks/use-copy";
import { cn, getUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { blo } from "blo";
import {
	Check,
	ChevronRight,
	Copy,
	CopyCheck,
	HeartHandshake,
	Loader2,
	Pencil,
	Send,
	Settings2,
	Share2,
	Sparkle,
	UserRoundCheck,
	UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAccount, useEnsName } from "wagmi";
import useGitcoinEcocerts from "../hooks/use-gitcoin-ecocerts";

const ProfileCard = ({
	address,
	stats,
	view,
	userHypercertIds,
}: {
	address: `0x${string}`;
	stats: {
		hypercertsCreated: number;
		hypercertsSupported: number;
		salesMadeCount: number;
	};
	view: "created" | "supported" | "transfer";
	userHypercertIds: string[];
}) => {
	const { data: ensName, isFetching: isEnsNameLoading } = useEnsName({
		address,
		chainId: 1,
	});

	const { gitcoinEcocerts, isGitcoinEcocertsLoading } =
		useGitcoinEcocerts(userHypercertIds);

	const { address: connectedWalletAddress } = useAccount();
	const isUserAddress = address === connectedWalletAddress;

	const { copy: copyAddress, isCopied: isAddressCopied } = useCopy();
	const { copy: copyProfileLink, isCopied: isProfileLinkCopied } = useCopy();
	const profileLink = getUrl(`/profile/${address}`);
	const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

	return (
		<div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-background">
			<div className="flex w-full items-center">
				<button
					type="button"
					className="flex w-full items-center justify-center gap-2 border-b border-b-border bg-background py-2 font-sans text-muted-foreground text-sm hover:bg-muted hover:text-foreground"
					onClick={() => copyProfileLink(profileLink)}
				>
					{isProfileLinkCopied ? <Check size={16} /> : <Share2 size={16} />}
					{isProfileLinkCopied ? "Copied Profile URL" : "Share Profile"}
				</button>
			</div>
			<div className="relative flex w-full flex-col items-center gap-4 p-4">
				<div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/50">
					<EthAvatar address={address as `0x${string}`} />
				</div>
				<div className="flex w-full flex-col items-center gap-2">
					{!ensName && isEnsNameLoading ? (
						<span
							className={
								"w-[80%] animate-pulse truncate text-center font-bold text-2xl text-muted-foregr"
							}
						>
							{shortAddress}
						</span>
					) : (
						<div className="flex w-full items-center justify-center">
							<span
								className={
									"max-w-[80%] truncate text-center font-bold text-2xl"
								}
							>
								{ensName ?? shortAddress}
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												className="text-muted-foreground"
												variant={"ghost"}
												size={"sm"}
												onClick={() => copyAddress(address)}
											>
												{isAddressCopied ? (
													<Check size={16} />
												) : (
													<Copy size={16} />
												)}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											{isAddressCopied ? "Copied" : "Copy Address"}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</span>
						</div>
					)}
					{stats.hypercertsCreated + stats.salesMadeCount >= 0 && (
						<span className="flex h-6 items-center justify-center rounded-full bg-beige-muted px-2 text-center text-beige-muted-foreground text-sm">
							{stats.hypercertsCreated > 0 ? "Community Member" : "Contributor"}
						</span>
					)}
				</div>
			</div>
			<ul className="mt-2 flex w-full flex-col gap-0.5 border-t border-t-border p-2">
				<li>
					<Link href={"?view=created"}>
						<Button
							variant={view === "created" ? "secondary" : "ghost"}
							className="w-full justify-between"
							size={"sm"}
						>
							<span className="flex items-center justify-start gap-2 text-left">
								<Sparkle size={16} className="text-primary" />
								Created Hypercerts
							</span>
							<span className="flex items-center justify-end gap-1 text-right text-muted-foreground">
								<span>{stats.hypercertsCreated}</span>
								<ChevronRight size={16} />
							</span>
						</Button>
					</Link>
				</li>
				<li>
					<Link href={"?view=supported"}>
						<Button
							variant={view === "supported" ? "secondary" : "ghost"}
							className="w-full justify-between"
							size={"sm"}
						>
							<span className="flex items-center justify-start gap-2 text-left">
								<HeartHandshake size={16} className="text-primary" />
								Supported Hypercerts
							</span>
							<span className="flex items-center justify-end gap-1 text-right text-muted-foreground">
								<span>{stats.hypercertsSupported}</span>
								<ChevronRight size={16} />
							</span>
						</Button>
					</Link>
				</li>
				{true && (
					<li>
						<Link href={"?view=transfer"}>
							<Button
								variant={view === "transfer" ? "secondary" : "ghost"}
								className="w-full justify-between"
								size={"sm"}
							>
								<span className="flex items-center justify-start gap-2 text-left">
									<Send size={16} className="text-primary" />
									Gitcoin Donations
								</span>
								<span className="flex items-center justify-end gap-1 text-right text-muted-foreground">
									<span>
										{isGitcoinEcocertsLoading ? (
											<Loader2 size={14} className="animate-spin" />
										) : (
											gitcoinEcocerts?.filter(
												(gitcoinEcocert) => gitcoinEcocert !== null,
											).length
										)}
									</span>
									<ChevronRight size={16} />
								</span>
							</Button>
						</Link>
					</li>
				)}
			</ul>
		</div>
	);
};

export default ProfileCard;
