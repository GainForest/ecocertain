"use client";

import { usePagination } from "@/hooks/use-pagination";

import { Button } from "@/components/ui/button";

import usePriceFeed from "@/app/PriceFeedProvider";
import type { Hypercert } from "@/app/graphql-queries/hypercerts";
import { ShowingDisplay, VDPaginator } from "@/components/global/vd-paginator";
import autoAnimate from "@formkit/auto-animate";
import Fuse from "fuse.js";
import { TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "./card";
import Search, { type SortOption, type SortKey } from "./search";

const calculateHypercertTotalSalesInUSD = (hypercert: Hypercert) => {
	const priceFeed = usePriceFeed();
	const { sales } = hypercert;
	const totalSalesInUSD =
		priceFeed.status === "ready"
			? sales.reduce((acc, sale) => {
					return (
						acc +
						(priceFeed.toUSD(
							sale.currency as `0x${string}`,
							Number(sale.currencyAmount),
						) ?? 0)
					);
			  }, 0)
			: null;
	return totalSalesInUSD;
};

export function GridView({ hypercerts }: { hypercerts: Hypercert[] }) {
	const searchInputState = useState("");
	const [searchInput, setSearchInput] = searchInputState;
	const sortOptionsState = useState<SortOption>({
		key: "totalSales",
		order: "desc",
	});
	const [sortOptions, setSortOptions] = sortOptionsState;

	const filteredHypercerts = useMemo(() => {
		if (searchInput === "") {
			return hypercerts;
		}
		const fuse = new Fuse(hypercerts, {
			keys: ["name", "description"],
			threshold: 0.1,
			ignoreLocation: true,
		});
		return fuse.search(searchInput).map((result) => result.item);
	}, [hypercerts, searchInput]);

	const gridRef = useRef<HTMLDivElement>(null);

	const clearAllFilters = useCallback(() => {
		setSearchInput("");
	}, [setSearchInput]);

	// biome-ignore lint/correctness/useExhaustiveDependencies(filteredHypercerts): gridRef updates when filteredHypercerts changes, so it is required in the dependency array, but the callback is independent from it
	useEffect(() => {
		if (gridRef.current) {
			autoAnimate(gridRef.current);
		}
	}, [filteredHypercerts]);

	const sortedHypercerts = useMemo(() => {
		const key = sortOptions.key;
		const order = sortOptions.order;
		const arr = [...filteredHypercerts];
		if (key === "date") {
			arr.sort((a, b) => {
				const diff =
					Number(a.creationBlockTimestamp) - Number(b.creationBlockTimestamp);
				return order === "asc" ? diff : -diff;
			});
		} else if (key === "price") {
			arr.sort((a, b) => {
				const aPrice = a.pricePerPercentInUSD ?? 0;
				const bPrice = b.pricePerPercentInUSD ?? 0;
				return order === "asc" ? aPrice - bPrice : bPrice - aPrice;
			});
		} else if (key === "totalSales") {
			arr.sort((a, b) => {
				const aSales = calculateHypercertTotalSalesInUSD(a) ?? 0;
				const bSales = calculateHypercertTotalSalesInUSD(b) ?? 0;
				return order === "asc" ? aSales - bSales : bSales - aSales;
			});
		}
		return arr;
	}, [filteredHypercerts, sortOptions]);

	return (
		<section
			className="flex w-full flex-col items-center px-2 py-6 md:px-6"
			id="discover"
		>
			<section className="flex w-full max-w-6xl flex-1 flex-col">
				{hypercerts.length > 0 && (
					<Search
						inputState={searchInputState}
						sortOptionsState={sortOptionsState}
					/>
				)}
				<div className="p-3" />
				{filteredHypercerts.length ? (
					<div
						className="grid grid-cols-[minmax(300px,_1fr)] gap-5 self-center lg:grid-cols-[300px_300px_300px] md:grid-cols-[300px_300px] md:gap-3"
						ref={gridRef}
					>
						{sortedHypercerts.map((hypercert: Hypercert) => (
							<Card
								hypercert={hypercert}
								key={hypercert.hypercertId}
								totalSalesInUSD={calculateHypercertTotalSalesInUSD(hypercert)}
							/>
						))}
					</div>
				) : (
					<section className="flex w-full items-center justify-center py-6">
						<div className="flex flex-col items-center pb-24 text-center md:pb-10">
							<TriangleAlert
								className="mb-4 text-muted-foreground/75"
								size={60}
							/>
							<p className="font-bold text-lg text-muted-foreground">
								We couldn't find any ecocerts matching your search or filter.
							</p>
							<p className="text-muted-foreground">
								Please remove some of your filters and try again.
							</p>
							<Button
								variant={"secondary"}
								className="mt-4"
								onClick={clearAllFilters}
							>
								Clear all filters
							</Button>
						</div>
					</section>
				)}
				{
					<section className="mt-4 flex flex-col items-center justify-center gap-2">
						{filteredHypercerts.length > 0 && (
							<ShowingDisplay
								currentPage={1}
								totalItemAmount={filteredHypercerts.length}
								itemsPerPage={filteredHypercerts.length}
							/>
						)}
						{/* <VDPaginator
							needsPagination={needsPagination}
							currentPage={currentPage}
							maxPage={maxPage}
							loadPage={loadPage}
						/> */}
					</section>
				}
			</section>
		</section>
	);
}
