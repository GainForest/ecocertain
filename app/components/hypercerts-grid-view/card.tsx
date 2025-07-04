"use client";
import usePriceFeed from "@/app/PriceFeedProvider";
import type { Hypercert } from "@/app/graphql-queries/hypercerts";
import CircularProgress from "@/components/ui/circular-progress";
import { SUPPORTED_CHAINS } from "@/config/wagmi";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CircularProgressbar } from "react-circular-progressbar";
import Progress from "../shared/progress";

// * REFACTORED from hypercerts-app hypercert-window
const Card = ({
	hypercert,
	totalSalesInUSD,
}: {
	hypercert: Hypercert;
	totalSalesInUSD: number | null;
}) => {
	const {
		hypercertId,
		name,
		description,
		totalUnits,
		sales,
		unitsForSale,
		pricePerPercentInUSD,
		chainId,
		buyerCount,
	} = hypercert;

	const chainName = SUPPORTED_CHAINS.find(
		(x) => x.id === Number(chainId),
	)?.name;
	const percentAvailable = calculateBigIntPercentage(unitsForSale, totalUnits);

	return (
		<Link href={`/hypercert/${hypercertId}`} passHref>
			<article className="group relative overflow-hidden rounded-2xl border border-border bg-muted">
				<div className="h-[320px] w-full overflow-hidden p-4">
					<Image
						src={`/api/hypercert-image/${hypercertId}`}
						alt={name ?? "Untitled"}
						height={500}
						width={500}
						className="h-auto w-full object-contain object-center transition group-hover:scale-[1.05]"
					/>
				</div>
				<section className="absolute top-4 left-4 flex space-x-1 opacity-100 transition-opacity duration-150 ease-out group-hover:opacity-100 md:opacity-0">
					<div className="flex items-center gap-1 rounded-md border border-black/60 bg-black px-2 py-0.5 text-white text-xs shadow-sm">
						<Calendar size={12} />{" "}
						{new Date(
							Number(hypercert.creationBlockTimestamp) * 1000,
						).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</div>
				</section>
				<section
					className="absolute bottom-0 flex w-full flex-col gap-2 border-t border-t-border bg-background/90 p-4 backdrop-blur-md"
					style={{
						boxShadow: "0 -10px 10px rgba(0, 0, 0, 0.1)",
					}}
				>
					<p
						className={cn(
							"line-clamp-2 h-[2.56rem] text-ellipsis break-words font-semibold text-lg leading-5",
							name
								? "font-baskerville text-foreground"
								: "text-muted-foreground",
						)}
					>
						{name ?? "[Untitled]"}
					</p>
					<p
						className={cn(
							"text-ellipsis text-muted-foreground text-sm",
							pricePerPercentInUSD === undefined
								? "mb-2.5 line-clamp-5 h-auto min-h-[100px]"
								: "line-clamp-2 h-10",
						)}
					>
						{description ?? "..."}
					</p>
					{pricePerPercentInUSD === undefined ? null : unitsForSale === 0n ? ( // </div> // 	</span> // 		Not listed for sale // 	<span className="inline-block rounded-full bg-beige-muted px-2 text-beige-muted-foreground"> // <div className="flex w-full items-center justify-start text-muted-foreground text-sm">
						<div className="flex w-full items-center justify-start text-muted-foreground text-sm">
							<span className="inline-block rounded-full bg-destructive/20 px-2 text-destructive">
								Sold
							</span>
						</div>
					) : (
						totalSalesInUSD !== null && (
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<div className="font-semibold text-sm">
										${totalSalesInUSD.toFixed(0)} raised
									</div>
									<div className="text-muted-foreground text-sm">
										${Math.floor(pricePerPercentInUSD * 100).toFixed(0)} target
										· {buyerCount} buyer{buyerCount !== 1 ? "s" : ""}
									</div>
								</div>
								<CircularProgress
									value={totalSalesInUSD / pricePerPercentInUSD}
									text={`${Math.min(
										Math.floor(totalSalesInUSD / pricePerPercentInUSD),
										100,
									).toFixed(0)}%`}
								/>
							</div>
						)
					)}
				</section>
			</article>
		</Link>
	);
};

export default Card;
