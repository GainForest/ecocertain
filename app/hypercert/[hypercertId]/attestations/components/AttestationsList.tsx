"use client";

import type { EcocertAttestation } from "@/app/graphql-queries/hypercerts";
import { Button } from "@/components/ui/button";
import EthAvatar from "@/components/ui/eth-avatar";
import QuickTooltip from "@/components/ui/quicktooltip";
import UserChip from "@/components/user-chip";
import autoAnimate from "@formkit/auto-animate";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BadgeCheck, CircleAlert, Eraser } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AttestationFilters from "./AttestationFilters";
import URLSource from "./URLSource";

dayjs.extend(relativeTime);

type SortOption = "newest" | "oldest";

export default function AttestationsList({
	attestations,
	creatorAddress,
}: {
	attestations: EcocertAttestation[];
	creatorAddress: `0x${string}`;
}) {
	const searchState = useState("");
	const sortState = useState<SortOption>("newest");
	const showCreatorOnlyState = useState(false);

	const [searchQuery, setSearchQuery] = searchState;
	const [sortBy, setSortBy] = sortState;
	const [showCreatorOnly, setShowCreatorOnly] = showCreatorOnlyState;

	const listRef = useRef<HTMLDivElement>(null);

	const filteredAndSortedAttestations = useMemo(() => {
		// First filter the attestations based on search query
		const filtered = attestations.filter((attestation) => {
			if (
				showCreatorOnly &&
				attestation.attester.toLowerCase() !== creatorAddress.toLowerCase()
			) {
				return false;
			}
			if (!searchQuery) return true;

			const searchLower = searchQuery.toLowerCase();
			const title = attestation.data.title.toLowerCase();
			const description = attestation.data.description.toLowerCase();
			const attester = attestation.attester.toLowerCase();

			return (
				title.includes(searchLower) ||
				description.includes(searchLower) ||
				attester.includes(searchLower)
			);
		});

		// Then sort the filtered results
		return [...filtered].sort((a, b) => {
			const timestampA = Number(a.creationBlockTimestamp);
			const timestampB = Number(b.creationBlockTimestamp);
			return sortBy === "newest"
				? timestampB - timestampA
				: timestampA - timestampB;
		});
	}, [attestations, searchQuery, sortBy, showCreatorOnly, creatorAddress]);

	// biome-ignore lint/correctness/useExhaustiveDependencies(filteredAndSortedAttestations.length): Apply autoanimate each time the list is empty / unempty
	useEffect(() => {
		if (listRef.current) {
			autoAnimate(listRef.current);
		}
	}, [filteredAndSortedAttestations.length === 0]);

	return (
		<>
			<AttestationFilters
				searchState={searchState}
				sortState={sortState}
				showCreatorOnlyState={showCreatorOnlyState}
			/>
			<div className="mt-4 flex flex-col gap-2" ref={listRef}>
				{filteredAndSortedAttestations.length === 0 && (
					<div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-4">
						<CircleAlert size={48} className="text-muted-foreground/50" />
						<p className="text-muted-foreground">Nothing to show.</p>
						<Button
							variant="secondary"
							className="gap-2"
							onClick={() => {
								setSearchQuery("");
								setShowCreatorOnly(false);
							}}
						>
							<Eraser size={16} />
							<span>Clear filters</span>
						</Button>
					</div>
				)}
				{filteredAndSortedAttestations.map((attestation) => {
					const creationDateFromNow = dayjs(
						Number(attestation.creationBlockTimestamp) * 1000,
					).fromNow();
					const urlSources = attestation.data.sources.filter(
						(source) => source.type === "url",
					);

					return (
						<div
							key={attestation.uid}
							className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 md:flex-row md:gap-8"
						>
							<div className="flex flex-1 flex-col gap-4">
								<div className="flex w-full items-center justify-between">
									<div className="flex items-center gap-2">
										<EthAvatar
											address={attestation.attester as `0x${string}`}
											size={36}
										/>
										<div className="flex flex-col">
											<UserChip
												address={attestation.attester as `0x${string}`}
												className="border-none bg-transparent p-0 font-bold text-sm"
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
														This proof of impact was attested by the creator of
														the hypercert.
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
								<div className="flex flex-col gap-2">
									<h3 className="font-bold">{attestation.data.title}</h3>
									<p className="text-muted-foreground">
										{attestation.data.description}
									</p>
								</div>
							</div>
							{urlSources.length > 0 && (
								<div className="flex flex-col gap-2 md:w-1/2">
									<span className="font-bold text-muted-foreground text-xs">
										Attached Links
									</span>
									<div className="flex flex-col divide-y overflow-hidden rounded-md border border-border bg-white">
										{urlSources.map((urlSource, index) => {
											const key = `${urlSource.src}-${index}`;
											return <URLSource key={key} urlSource={urlSource} />;
										})}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</>
	);
}
