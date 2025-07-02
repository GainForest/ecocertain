import { SUPPORTED_CHAINS } from "@/config/wagmi";
import type { Hypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Progress from "../shared/progress";

// * REFACTORED from hypercerts-app hypercert-window
const Card = ({ hypercert }: { hypercert: Hypercert }) => {
	const {
		hypercertId,
		name,
		description,
		totalUnits,
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
					<div className="rounded-md border border-white/60 bg-black px-2 py-0.5 text-white text-xs shadow-sm">
						{chainName ?? "Unknown chain"}
					</div>
					<div className="rounded-md border border-black/60 bg-black px-2 py-0.5 text-white text-xs shadow-sm">
						approved
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
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<div className="font-semibold text-sm">
									$
									{Math.floor(
										(100 - (percentAvailable ?? 0)) *
											pricePerPercentInUSD *
											100,
									) / 100}{" "}
									USD raised
								</div>
								<div className="text-muted-foreground text-sm">
									${Math.floor(pricePerPercentInUSD * 100)} target ·{" "}
									{buyerCount} buyer{buyerCount !== 1 ? "s" : ""}
								</div>
							</div>
							<div className="relative h-16 w-16">
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="font-medium text-sm">
										{Math.floor(100 - (percentAvailable ?? 0))}%
									</span>
								</div>
								<svg
									className="-rotate-90 h-full w-full"
									aria-label="Progress Circle"
								>
									<title>Progress Circle</title>
									<circle
										className="stroke-muted"
										strokeWidth="4"
										fill="none"
										r="28"
										cx="32"
										cy="32"
									/>
									<circle
										className="stroke-primary"
										strokeWidth="4"
										fill="none"
										r="28"
										cx="32"
										cy="32"
										strokeDasharray={`${
											((100 - (percentAvailable ?? 0)) * 175.93) / 100
										} 175.93`}
									/>
								</svg>
							</div>
						</div>
					)}
				</section>
			</article>
		</Link>
	);
};

export default Card;
