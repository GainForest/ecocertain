import { ArrowRight, Sparkle } from "lucide-react";
import Image from "next/image";
import { forwardRef, memo } from "react";

export interface HypercertCardProps {
	title?: string;
	banner?: string;
	logo?: string;
	workStartDate?: Date;
	workEndDate?: Date;
	badges?: string[];
	displayOnly?: boolean;
	hypercertId?: string;
	contributors?: string[];
}

const HypercertCard = forwardRef<HTMLDivElement, HypercertCardProps>(
	(
		{
			title = "Your title here",
			banner,
			logo,
			workStartDate,
			workEndDate,
			badges = [],
			displayOnly = false,
		}: HypercertCardProps,
		ref,
	) => {
		const formattedDateRange =
			workStartDate && workEndDate ? (
				workStartDate === workEndDate ? (
					workStartDate.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
					})
				) : (
					<span className="flex items-center">
						{workStartDate.toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
						<ArrowRight size={12} className="mx-1 inline" />
						{workEndDate.toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</span>
				)
			) : null;

		const maxVisibleTags = 6;
		const maxBadgeLength = 18;

		const clipBadge = (badge: string) =>
			badge.length > maxBadgeLength
				? `${badge.slice(0, maxBadgeLength - 3)}...`
				: badge;

		const visibleBadges = badges.slice(0, maxVisibleTags).map(clipBadge);
		const hiddenBadgesCount = badges.length - visibleBadges.length;

		return (
			<article
				ref={ref}
				className="relative h-[420px] w-[336px] overflow-clip rounded-xl border-[1px] border-black bg-black"
			>
				<header className="relative flex h-[173px] w-full items-center justify-center overflow-clip rounded-b-xl">
					{banner ? (
						<Image
							src={`${banner}`}
							alt={`${title} banner`}
							className="object-cover object-center"
							fill
							unoptimized
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-slate-200">
							<span className="text-lg text-slate-500">Your banner here</span>
						</div>
					)}
				</header>
				<section className="absolute top-4 left-3 overflow-hidden rounded-full border-2 border-white bg-slate-200">
					<div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-300">
						{logo ? (
							<Image
								src={`${logo}`}
								alt={`${title} logo`}
								fill
								unoptimized
								className="object-cover"
							/>
						) : (
							<div className="flex h-10 w-10 items-center justify-center bg-slate-300">
								<Sparkle size={24} />
							</div>
						)}
					</div>
				</section>
				<section className="flex h-[246px] flex-col justify-between rounded-t-xl border-black border-t-[1px] bg-white p-3 pt-4">
					<h5
						className="line-clamp-3 text-ellipsis py-1 font-semibold text-[25px] text-slate-800 leading-[27px] tracking-[-0.03em]"
						title={title}
					>
						{title}
					</h5>
					<section className="border-black border-t-[1.5px]">
						<div className="flex items-center justify-between pt-1 pb-2">
							<span className="font-medium text-xs uppercase">ecocert</span>
							<span className="font-medium text-xs uppercase">
								{formattedDateRange}
							</span>
						</div>
						<div className="mt-auto h-[62px] w-full overflow-hidden">
							<div className="flex h-full flex-wrap content-end justify-start gap-1 pb-1">
								{visibleBadges.map((badge) => (
									<span
										key={badge}
										className="flex items-center rounded-lg border-[1.5px] border-black px-2 py-1 text-base leading-none"
										title={
											badge.endsWith("...")
												? badges.find((b) => b.startsWith(badge.slice(0, -3)))
												: badge
										}
									>
										{badge}
									</span>
								))}
								{hiddenBadgesCount > 0 && (
									<div className="flex items-center justify-center rounded-full border border-black bg-neutral-100 px-2 py-1 font-medium text-slate-900 text-sm leading-none">
										+{hiddenBadgesCount}
									</div>
								)}
							</div>
						</div>
					</section>
				</section>
			</article>
		);
	},
);

HypercertCard.displayName = "HypercertCard";

export default memo(HypercertCard);
