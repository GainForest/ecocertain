"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { Award, Divide, DollarSign, Download, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import usePriceFeed from "../PriceFeedProvider";
import { getCurrencyFromAddress } from "../hypercert/[hypercertId]/components/PurchaseFlow/utils/getCurrencyFromAddress";
import RoundDataTable from "./RoundTable";
import { fetchSalesDataByPeriod } from "./sales-data-by-period";

type RoundStats = {
	totalFundingUSD: number;
	uniqueBuyers: number;
	uniqueHypercerts: number;
	totalTransactions: number;
};

const RoundStats = ({ stats }: { stats: RoundStats }) => {
	return (
		<div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
			<div className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-green-600">
				<div className="rounded-b-lg bg-white p-4 font-bold text-2xl text-green-600">
					${stats.totalFundingUSD.toLocaleString()}
				</div>
				<DollarSign className="absolute top-2 right-2 h-4 w-4 text-green-600" />
				<div className="flex items-center justify-center px-2 py-1 text-center font-mono text-white text-xs">
					Total Funding (USD)
				</div>
			</div>

			<div className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-blue-600">
				<div className="rounded-b-lg bg-white p-4 font-bold text-2xl text-blue-600">
					{stats.uniqueBuyers}
				</div>
				<Users className="absolute top-2 right-2 h-4 w-4 text-blue-600" />
				<div className="flex items-center justify-center px-2 py-1 text-center font-mono text-white text-xs">
					Unique Buyers
				</div>
			</div>

			<div className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-purple-600">
				<div className="rounded-b-lg bg-white p-4 font-bold text-2xl text-purple-600">
					{stats.uniqueHypercerts}
				</div>
				<Award className="absolute top-2 right-2 h-4 w-4 text-purple-600" />
				<div className="flex items-center justify-center px-2 py-1 text-center font-mono text-white text-xs">
					Unique Hypercerts
				</div>
			</div>

			<div className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-orange-600">
				<div className="rounded-b-lg bg-white p-4 font-bold text-2xl text-orange-600">
					{stats.totalTransactions}
				</div>
				<Download className="absolute top-2 right-2 h-4 w-4 text-orange-600" />
				<div className="flex items-center justify-center px-2 py-1 text-center font-mono text-white text-xs">
					Total Transactions
				</div>
			</div>
		</div>
	);
};

export type Round = {
	id: number;
	starts: number;
	ends: number;
};

export function RoundDataWrapper({
	round,
	cta,
	children,
	showSkeleton = false,
}: {
	round: Round;
	cta: React.ReactNode;
	children: React.ReactNode;
	showSkeleton?: boolean;
}) {
	const startDateStr = new Date(round.starts * 1000).toLocaleString("en-US", {
		day: "numeric",
		month: "long",
	});
	const endDateStr = new Date(round.ends * 1000).toLocaleString("en-US", {
		day: "numeric",
		month: "long",
	});

	return (
		<li className="w-full list-none rounded-lg border border-beige-muted bg-background p-4 font-sans">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="font-bold">Round {round.id}</span>
					<span className="rounded-full bg-muted px-2 py-1 font-sans text-muted-foreground text-xs">
						<b>{startDateStr}</b> to <b>{endDateStr}</b>
					</span>
				</div>
				{cta}
			</div>
			<div
				className={cn(
					"mt-4 w-full rounded-lg bg-muted p-2",
					showSkeleton ? "animate-pulse" : "",
				)}
			>
				{showSkeleton ? <div className="h-20 w-full" /> : children}
			</div>
		</li>
	);
}

const RoundData = ({ round }: { round: Round }) => {
	const [currentDate, setCurrentDate] = useState<number | null>(null);
	const priceFeed = usePriceFeed();

	useEffect(() => {
		setCurrentDate(new Date().getTime() / 1000);
	}, []);

	const { data, isPending, isLoading, error } = useQuery({
		queryKey: ["sales", round.id],
		queryFn: () => fetchSalesDataByPeriod(round.starts, round.ends),
		enabled: !!currentDate && currentDate > round.starts,
	});

	const calculateStats = (): RoundStats => {
		if (!data || data.length === 0) {
			return {
				totalFundingUSD: 0,
				uniqueBuyers: 0,
				uniqueHypercerts: 0,
				totalTransactions: 0,
			};
		}

		const uniqueBuyers = new Set<string>();
		const uniqueHypercerts = new Set<string>();
		let totalFundingUSD = 0;
		let totalTransactions = 0;

		for (const saleByHypercert of data) {
			uniqueHypercerts.add(saleByHypercert.hypercertId);

			for (const sale of saleByHypercert.sales) {
				uniqueBuyers.add(sale.buyer);
				totalTransactions++;

				// Calculate USD value using PriceFeed
				if (priceFeed.status === "ready") {
					const usdAmount = priceFeed.toUSD(
						sale.currency as `0x${string}`,
						BigInt(sale.currencyAmount),
					);
					if (usdAmount !== null) {
						totalFundingUSD += usdAmount;
					}
				} else {
					// Fallback to simplified conversion if PriceFeed is not ready
					const currency = getCurrencyFromAddress(42220, sale.currency);
					if (currency) {
						const amount = BigNumber(sale.currencyAmount)
							.div(10 ** currency.decimals)
							.toNumber();

						// Simplified USD conversion - you might want to use real-time exchange rates
						// For now, assuming CELO ≈ $0.5 USD (this should be updated with real rates)
						const usdRate = currency.symbol === "CELO" ? 0.5 : 1; // Placeholder rate
						totalFundingUSD += amount * usdRate;
					}
				}
			}
		}

		return {
			totalFundingUSD: Math.round(totalFundingUSD * 100) / 100, // Round to 2 decimal places
			uniqueBuyers: uniqueBuyers.size,
			uniqueHypercerts: uniqueHypercerts.size,
			totalTransactions,
		};
	};

	const exportToCSV = () => {
		if (!data || data.length === 0) return;

		// Create CSV content
		const headers = [
			"Hypercert",
			"Hypercert ID",
			"Amount",
			"Currency",
			"Amount (USD)",
			"Buyer",
			"Transaction Hash",
			"Timestamp",
		];
		const csvRows = [headers.join(",")];

		for (const saleByHypercert of data) {
			for (const sale of saleByHypercert.sales) {
				const currency = getCurrencyFromAddress(42220, sale.currency);
				if (!currency) {
					console.error(`Currency ${sale.currency} not found`);
					continue;
				}

				const amount = BigNumber(sale.currencyAmount)
					.div(10 ** currency.decimals)
					.toFixed(2);

				// Calculate USD amount using PriceFeed
				let usdAmount = "0.00";
				if (priceFeed.status === "ready") {
					const usdValue = priceFeed.toUSD(
						sale.currency as `0x${string}`,
						BigInt(sale.currencyAmount),
					);
					if (usdValue !== null) {
						usdAmount = usdValue.toFixed(2);
					}
				} else {
					// Fallback to simplified conversion if PriceFeed is not ready
					const amountNumber = BigNumber(sale.currencyAmount)
						.div(10 ** currency.decimals)
						.toNumber();
					const usdRate = currency.symbol === "CELO" ? 0.5 : 1; // Placeholder rate
					usdAmount = (amountNumber * usdRate).toFixed(2);
				}

				const timestamp = new Date(sale.timestamp * 1000).toISOString();

				const row = [
					`"${saleByHypercert.hypercertName}"`,
					saleByHypercert.hypercertId,
					amount,
					currency.symbol,
					usdAmount,
					sale.buyer,
					sale.transactionHash,
					timestamp,
				];
				csvRows.push(row.join(","));
			}
		}

		const csvContent = csvRows.join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", `round-${round.id}-sales.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (!currentDate) return null;

	return (
		<RoundDataWrapper
			round={round}
			showSkeleton={round.starts > currentDate ? false : isPending}
			cta={
				<Button
					variant="outline"
					size="sm"
					onClick={exportToCSV}
					disabled={!data || data.length === 0}
					className="gap-2"
				>
					<Download size={14} />
					Export CSV
				</Button>
			}
		>
			{data ? (
				data.length > 0 ? (
					<>
						<RoundStats stats={calculateStats()} />
						<RoundDataTable roundData={data} />
					</>
				) : (
					<div className="text-center">
						{round.ends < currentDate
							? "No hypercerts were sold in this round."
							: "No hypercerts had been sold in this round yet."}
					</div>
				)
			) : (
				<div className="text-center">
					{round.starts > currentDate
						? "This round has not started yet."
						: "Unable to fetch data for this round."}
				</div>
			)}
		</RoundDataWrapper>
	);
};

export default RoundData;
