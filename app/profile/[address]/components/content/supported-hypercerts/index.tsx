import React from "react";

import { CircleAlert } from "lucide-react";
import type { CombinedSale } from "../../../page";
import Card from "./card";

const NoSupportedHypercerts = () => {
	return (
		<div className="flex flex-col items-center gap-4 pt-6 text-center md:px-20">
			<CircleAlert className="text-beige-muted-foreground/50" size={40} />
			<p className="px-8 text-beige-muted-foreground">
				Hypercerts that you support appear here.
			</p>
		</div>
	);
};

const SupportedHypercerts = ({
	combinedSales,
}: {
	combinedSales: CombinedSale[];
}) => {
	if (combinedSales.length === 0) return <NoSupportedHypercerts />;
	const newestSortedCombinedSales = combinedSales.sort((a, b) =>
		Number(b.lastSaleTimestamp - a.lastSaleTimestamp),
	);
	return (
		<div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
			{newestSortedCombinedSales.map((sale) => {
				return <Card key={sale.id} combinedSale={sale} />;
			})}
		</div>
	);
};

export default SupportedHypercerts;
