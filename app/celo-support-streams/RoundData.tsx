"use client";

import { Button } from "@/components/ui/button";
import { fetchSalesDataByPeriod } from "@/graphql/hypercerts/queries/period-sales";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Divide, Download } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import RoundDataTable from "./RoundTable";

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
	useEffect(() => {
		setCurrentDate(new Date().getTime() / 1000);
	}, []);

	const { data, isPending, isLoading, error } = useQuery({
		queryKey: ["sales", round.id],
		queryFn: () => fetchSalesDataByPeriod(round.starts, round.ends),
		enabled: !!currentDate && currentDate > round.starts,
	});

	const exportToCSV = () => {
		if (!data || data.length === 0) return;

		// Create CSV content
		const headers = [
			"Hypercert",
			"Hypercert ID",
			"Amount (Celo)",
			"Buyer",
			"Transaction Hash",
			"Timestamp",
		];
		const csvRows = [headers.join(",")];

		for (const saleByHypercert of data) {
			for (const sale of saleByHypercert.sales) {
				const amount = (
					Number(BigInt(sale.currencyAmount) / BigInt(10 ** 10)) /
					10 ** 8
				).toFixed(2);

				const timestamp = new Date(sale.timestamp * 1000).toISOString();

				const row = [
					`"${saleByHypercert.hypercertName}"`,
					saleByHypercert.hypercertId,
					amount,
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
					<RoundDataTable roundData={data} />
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
