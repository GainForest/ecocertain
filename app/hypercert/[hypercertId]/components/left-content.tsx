import MarkdownEditor from "@/components/ui/mdx-editor";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import UserChip from "@/components/user-chip";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { bigintToFormattedDate } from "@/lib/utils";
import { CalendarCheck, CalendarDays, User2 } from "lucide-react";
import type React from "react";
import VerificationIndicator from "./VerificationIndicator";
import NFT3D from "./nft-3d";
import Support from "./support";

const MetadataCard = ({
	title,
	children,
}: {
	title: React.ReactNode;
	children: React.ReactNode;
}) => {
	return (
		<div className="flex shrink-0 flex-col justify-between gap-1 rounded-xl bg-muted p-2 text-sm">
			<span className="font-bold text-muted-foreground text-xs">{title}</span>
			{children}
		</div>
	);
};

const Metadata = ({ hypercert }: { hypercert: FullHypercert }) => {
	const work = hypercert.metadata.work;
	return (
		<ScrollArea
			className="w-full"
			style={{
				maskImage:
					"linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0) 100%)",
			}}
		>
			<div className="flex items-stretch gap-2 p-2">
				<MetadataCard
					title={
						<span className="flex items-center gap-1">
							<User2 size={14} /> Created by
						</span>
					}
				>
					<UserChip
						className="p-0.5"
						avatarSize={20}
						address={hypercert.creatorAddress as `0x${string}`}
					/>
				</MetadataCard>
				<MetadataCard
					title={
						<span className="flex items-center gap-1">
							<CalendarCheck size={14} /> Created on
						</span>
					}
				>
					{bigintToFormattedDate(hypercert.creationBlockTimestamp)}
				</MetadataCard>
				{work.from !== undefined && work.to !== undefined && (
					<MetadataCard
						title={
							<span className="flex items-center gap-1">
								<CalendarDays size={14} /> Work Timeframe
							</span>
						}
					>
						{bigintToFormattedDate(work.from)}
						{" - "}
						{bigintToFormattedDate(work.to)}
					</MetadataCard>
				)}
				<div className="h-2 w-[20%]" />
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
};

const LeftContent = ({ hypercert }: { hypercert: FullHypercert }) => {
	return (
		<div className="flex w-full flex-initial flex-col gap-6 lg:w-auto lg:flex-[3]">
			<div className="overflow-hidden rounded-2xl border border-border bg-beige-muted/80">
				<VerificationIndicator />
				<div className="flex w-full flex-col items-center justify-center p-2">
					<div className="w-full max-w-sm">
						<NFT3D src={`/api/hypercert-image/${hypercert.hypercertId}`} />
					</div>
					<section className="mt-2 flex w-full flex-col gap-2 rounded-xl bg-background p-3 shadow-[0px_-10px_20px_rgba(0,0,0,0.1)]">
						<Metadata hypercert={hypercert} />
						<div className="flex flex-col gap-2 p-0 md:p-2">
							<h2 className="font-baskerville font-bold text-muted-foreground text-xl">
								Description
							</h2>
							<div className="text-justify leading-tight">
								<MarkdownEditor
									markdown={hypercert.metadata.description ?? ""}
									editorRef={null}
									showToolbar={false}
									readOnly
								/>
							</div>
						</div>
					</section>
				</div>
			</div>

			<Support hypercert={hypercert} />
		</div>
	);
};

export default LeftContent;
