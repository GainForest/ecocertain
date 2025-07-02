import type { Hypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { HeartHandshake, Sparkle } from "lucide-react";
import React from "react";
import type { CombinedSale } from "../../page";
import CreatedHypercerts from "./created-hypercerts";
import SupportedHypercerts from "./supported-hypercerts";

const Content = ({
	view,
	combinedSales,
	createdHypercerts,
}: {
	view: "created" | "supported";
	combinedSales: CombinedSale[];
	createdHypercerts: Hypercert[];
}) => {
	return (
		<section className="mt-2 flex w-full flex-1 flex-col gap-6">
			<span className="ml-4 flex items-center gap-4 font-baskerville font-bold text-3xl">
				{view === "created" ? (
					<Sparkle className="text-primary" size={36} />
				) : (
					<HeartHandshake className="text-primary" size={36} />
				)}
				<span>{view === "created" ? "Created" : "Supported"} Hypercerts</span>
			</span>
			{view === "created" ? (
				<CreatedHypercerts hypercerts={createdHypercerts} />
			) : (
				<SupportedHypercerts combinedSales={combinedSales} />
			)}
		</section>
	);
};

export default Content;
