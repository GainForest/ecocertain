"use client";

import usePriceFeed from "@/app/PriceFeedProvider";
import CreateListingDialog from "@/app/components/create-listing-dialog";
import Progress from "@/app/components/shared/progress";
import useFullHypercert from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import QuickTooltip from "@/components/ui/quicktooltip";
import { RAW_TOKENS_CONFIG } from "@/config/raw-tokens";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import useAccount from "@/hooks/use-account";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { convertCurrencyPriceToUSD, formatDecimals } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
	ArrowRight,
	BadgeDollarSign,
	CircleAlert,
	Clock,
	RefreshCcw,
} from "lucide-react";
import React from "react";
import usePaymentProgressStore from "./PurchaseFlow/payment-progress/store";
import SelectAmount from "./PurchaseFlow/select-amount";
import SelectOrder from "./PurchaseFlow/select-order";
import usePurchaseFlowStore from "./PurchaseFlow/store";

const ProgressIndicator = ({
	percentage,
	tooltipText,
	tooltipWidth,
	direction,
}: {
	percentage: number;
	tooltipText: string;
	tooltipWidth?: number;
	direction: "top" | "bottom";
}) => {
	return (
		<div
			className={cn(
				"relative mb-1 h-[12px] w-full",
				direction === "top" ? "mb-1" : "mt-1",
			)}
		>
			<div
				className="-translate-x-1/2 absolute top-0 left-[-50%]"
				style={{
					left: `${percentage}%`,
				}}
			>
				<div
					className={cn(
						"relative mx-auto h-0 w-0 scale-75 border-x-[8px] border-x-transparent transition-all duration-300 group-hover:scale-100",
						direction === "top"
							? "origin-bottom border-t-[12px] border-t-beige-muted-foreground"
							: "origin-top border-b-[12px] border-b-primary/70",
					)}
				>
					<div
						className={cn(
							"-translate-x-1/2 pointer-events-none absolute left-1/2 scale-0 rounded-full bg-background px-2 py-0.5 text-center font-bold text-sm opacity-0 shadow-md blur-xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-hover:blur-none",
							direction === "top"
								? "bottom-[14px] mb-1 origin-bottom text-beige-muted-foreground"
								: "top-[14px] mt-1 origin-top text-primary",
						)}
						style={{
							width: tooltipWidth ? `${tooltipWidth}px` : undefined,
						}}
					>
						{tooltipText}
					</div>
				</div>
			</div>
		</div>
	);
};

const LoadingVariant = () => {
	return (
		<div className="flex h-full w-full flex-col justify-between font-sans">
			<div className="group flex w-full flex-col">
				<div className="flex flex-col items-center gap-1">
					<span className="h-10 w-40 animate-pulse rounded-lg bg-beige-muted" />
					<span className="h-8 w-32 animate-pulse rounded-lg bg-beige-muted" />
				</div>
				<div className="mt-4 flex w-full flex-col items-center">
					<div className="relative w-full">
						<div className="h-6 animate-pulse rounded-sm bg-primary/20" />
					</div>
				</div>
			</div>
			<div className="mt-2 flex items-center justify-end">
				<div className="h-8 w-20 animate-pulse rounded-lg bg-beige-muted" />
			</div>
		</div>
	);
};

const ErrorVariant = () => {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-2">
			<div className="flex flex-col items-center justify-center gap-2">
				<CircleAlert size={40} className="text-muted-foreground opacity-50" />
				<span className="font-bold text-lg text-muted-foreground">
					Unable to load funding statistics.
				</span>
				<Button
					variant={"outline"}
					size={"sm"}
					className="gap-2"
					onClick={() => window?.location.reload()}
				>
					<RefreshCcw size={14} />
					<span>Retry</span>
				</Button>
			</div>
		</div>
	);
};

const OpenVariant = ({
	totalSalesInUSD,
	percentageUnitsSold,
	goalInUSD,
}: {
	totalSalesInUSD: number;
	percentageUnitsSold: number;
	goalInUSD: number;
}) => {
	const goalPercentageOnBar =
		totalSalesInUSD <= goalInUSD ? 100 : (goalInUSD / totalSalesInUSD) * 100;
	const { show, pushModalByVariant, stack } = useModal();
	const purchasePaymentStatus = usePaymentProgressStore(
		(state) => state.status,
	);
	const resetPaymentProgress = usePaymentProgressStore((state) => state.reset);

	const hypercert = useFullHypercert();

	const handleShowPurchaseFlow = () => {
		const lastModalId = stack.length > 0 ? stack[stack.length - 1] : null;
		if (
			!lastModalId ||
			!lastModalId.startsWith("purchase-flow") ||
			purchasePaymentStatus === "success"
		) {
			resetPaymentProgress();
			pushModalByVariant(
				{
					id: "purchase-flow-select-order",
					content: <SelectOrder hypercert={hypercert} />,
				},
				true,
			);
			show();
			return;
		}
		show();
	};
	return (
		<div className="flex h-full w-full flex-col justify-between font-sans">
			<div className="group flex w-full flex-col">
				<div className="flex flex-col items-center">
					<span className="font-bold text-3xl text-primary">
						${totalSalesInUSD}
					</span>
					<span className="font-bold text-beige-muted-foreground text-xl">
						out of ${goalInUSD}
					</span>
					<span className="font-bold text-muted-foreground text-sm">
						sold so far.
					</span>
				</div>
				<div className="mt-4 flex w-full flex-col items-center">
					<div className="relative w-full">
						<Progress
							percentage={Math.min((totalSalesInUSD * 100) / goalInUSD, 100)}
							className="h-6 rounded-sm bg-beige-muted"
						/>
						{goalPercentageOnBar < 99 && (
							<div
								className="-translate-x-[2px] absolute top-1 bottom-1 w-[4px] rounded-full bg-white shadow-md"
								style={{
									left: `${goalPercentageOnBar}%`,
								}}
							/>
						)}
					</div>
					<ProgressIndicator
						percentage={goalPercentageOnBar}
						tooltipText={"Goal"}
						direction="bottom"
					/>
				</div>
			</div>
			<div className="mt-2 flex items-center justify-end">
				<Button onClick={handleShowPurchaseFlow}>
					Buy <ArrowRight size={16} />
				</Button>
			</div>
		</div>
	);
};

const ComingVariant = () => {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-2">
			<div className="flex flex-col items-center justify-center gap-2 text-beige-muted-foreground">
				<Clock size={40} />
				<span className="font-bold text-xl">
					This hypercert is not listed for sale.
				</span>
			</div>
			<span className="text-balance text-center text-muted-foreground">
				Stay tuned for updates.
			</span>
		</div>
	);
};

const ListingOptionVariant = () => {
	const hypercert = useFullHypercert();
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-2">
			<div className="flex flex-col items-center justify-center gap-2 text-beige-muted-foreground">
				<BadgeDollarSign size={40} />
				<span className="font-bold text-xl">Need donations?</span>
			</div>
			<span className="text-balance text-center text-muted-foreground">
				List for sale to get donations.
			</span>
			<CreateListingDialog
				hypercertId={hypercert.hypercertId}
				trigger={
					<Button className="gap-2" size={"sm"}>
						<span>List for sale</span>
						<ArrowRight size={16} />
					</Button>
				}
			/>
		</div>
	);
};

const SoldVariant = () => {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-2">
			<div className="flex flex-col items-center justify-center gap-2 text-destructive">
				<CircleAlert size={40} />
				<span className="font-bold text-xl">Sold Out</span>
			</div>
			<span className="text-balance text-center text-muted-foreground">
				This hypercert is no longer for sale.
			</span>
		</div>
	);
};

const VariantSelector = () => {
	const hypercert = useFullHypercert();
	const {
		totalUnits,
		unitsForSale,
		cheapestOrder: { pricePerPercentInUSD },
		sales,
	} = hypercert;
	const { address } = useAccount();
	const priceFeed = usePriceFeed();

	// Calculate total sales in USD synchronously
	const totalSalesInUSD = React.useMemo(() => {
		if (priceFeed.status !== "ready" || !sales || sales.length === 0) {
			return 0;
		}
		let total = 0;
		for (const sale of sales) {
			const usd = priceFeed.toUSD(
				sale.currency as `0x${string}`,
				BigInt(sale.currencyAmount),
			);
			if (usd !== null) {
				total += usd;
			}
		}
		return total;
	}, [sales, priceFeed]);

	if (priceFeed.status === "loading") {
		return <LoadingVariant />;
	}

	if (priceFeed.status === "error") {
		return <ErrorVariant />;
	}

	if (pricePerPercentInUSD === undefined) {
		if (hypercert.creatorAddress.toLowerCase() === address?.toLowerCase()) {
			return <ListingOptionVariant />;
		}
		return <ComingVariant />;
	}
	if (unitsForSale === 0n) return <SoldVariant />;
	const unitsSold = totalUnits - unitsForSale;
	const percentCompleted = calculateBigIntPercentage(unitsSold, totalUnits);
	if (percentCompleted === undefined) return <SoldVariant />;
	return (
		<OpenVariant
			percentageUnitsSold={percentCompleted}
			goalInUSD={formatDecimals(100 * pricePerPercentInUSD)}
			totalSalesInUSD={formatDecimals(totalSalesInUSD)}
		/>
	);
};

const FundingView = () => {
	return (
		<div className="relative min-h-40 w-full max-w-full overflow-hidden rounded-xl border border-border bg-background/50 p-4 md:w-auto md:max-w-md md:flex-1 md:basis-full">
			<VariantSelector />
		</div>
	);
};

export default FundingView;
