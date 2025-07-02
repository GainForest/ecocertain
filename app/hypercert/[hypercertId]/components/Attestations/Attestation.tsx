import { Button } from "@/components/ui/button";
import EthAvatar from "@/components/ui/eth-avatar";
import QuickTooltip from "@/components/ui/quicktooltip";
import UserChip from "@/components/user-chip";
import type { EcocertAttestation } from "@/graphql/hypercerts/queries/hypercerts";
import useCopy from "@/hooks/use-copy";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowUpRight, BadgeCheck, Check, Copy, Globe } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

dayjs.extend(relativeTime);

const URLSource = ({
	urlSource,
}: {
	urlSource: { src: string; description?: string };
}) => {
	return (
		<div className="rounded-md border border-border bg-background">
			<div className="flex w-full items-center justify-start gap-2 p-2">
				<div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
					<Globe className="text-primary" size={16} />
				</div>
				<div className="flex flex-1 flex-col">
					<input
						type="text"
						className="h-auto w-full truncate bg-transparent p-0 font-bold text-sm"
						value={urlSource.description ?? urlSource.src}
						readOnly
						disabled
					/>
					<input
						type="text"
						className="h-auto w-full truncate bg-transparent p-0 text-muted-foreground text-xs"
						value={urlSource.src}
						readOnly
						disabled
					/>
				</div>

				<Link href={urlSource.src} target="_blank">
					<Button variant="outline" size={"sm"}>
						<ArrowUpRight size={16} />
					</Button>
				</Link>
			</div>
		</div>
	);
};

const Attestation = ({
	attestation,
	creatorAddress,
}: {
	attestation: EcocertAttestation;
	creatorAddress: `0x${string}`;
}) => {
	const creationDateFromNow = dayjs(
		Number(attestation.creationBlockTimestamp) * 1000,
	).fromNow();
	const urlSources = attestation.data.sources.filter(
		(source) => source.type === "url",
	);
	const [isShowingAllAttachments, setShowingAllAttachments] = useState(false);
	return (
		<div
			className="flex flex-col gap-4 rounded-lg bg-accent p-4 font-sans"
			key={attestation.uid}
		>
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-2">
					<EthAvatar
						address={attestation.attester as `0x${string}`}
						size={36}
					/>
					<div className="flex flex-col">
						<UserChip
							address={attestation.attester as `0x${string}`}
							className="border-none p-0 font-bold text-sm"
							showCopyButton="hover"
							showAvatar={false}
						/>
						<span className="text-muted-foreground text-xs">
							{creationDateFromNow}
						</span>
					</div>
				</div>
				{attestation.attester.toLowerCase() ===
					creatorAddress.toLowerCase() && (
					<QuickTooltip
						content={
							<div className="flex max-w-[200px] flex-col items-center gap-1">
								<BadgeCheck size={24} className="text-primary" />
								<span className="text-balance text-center font-sans text-muted-foreground text-xs">
									This proof of impact was attested by the creator of the
									hypercert.
								</span>
							</div>
						}
						asChild
					>
						<Button
							variant={"outline"}
							size={"sm"}
							className="h-auto w-auto gap-1 rounded-full px-1.5 py-1.5 text-primary leading-none"
						>
							<BadgeCheck size={16} />
							<span>Creator</span>
						</Button>
					</QuickTooltip>
				)}
			</div>
			<div className="flex flex-col">
				<b>{attestation.data.title}</b>
				<p className="">{attestation.data.description}</p>
			</div>
			{urlSources.length > 0 && (
				<div className="flex flex-col gap-1">
					<span className="font-bold font-sans text-muted-foreground text-xs">
						Attached Links
					</span>
					<div className="flex flex-col gap-1">
						{urlSources
							.slice(0, isShowingAllAttachments ? undefined : 2)
							.map((urlSource, index) => {
								const key = `${urlSource.src}-${index}`;
								return <URLSource urlSource={urlSource} key={key} />;
							})}
						{urlSources.length > 2 && (
							<div className="flex items-center justify-center">
								<Button
									variant={"link"}
									size={"sm"}
									className="text-xs"
									onClick={() => {
										setShowingAllAttachments(!isShowingAllAttachments);
									}}
								>
									{isShowingAllAttachments ? "Hide" : "View all attachments"}
								</Button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Attestation;
