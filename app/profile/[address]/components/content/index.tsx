import type { Hypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { Building, HeartHandshake, Sparkle } from "lucide-react";
import React from "react";
import type { CombinedSale } from "../../page";
import CreatedHypercerts from "./created-hypercerts";
import OrganizationsPage from "./organizations";
import SupportedHypercerts from "./supported-hypercerts";

const Content = ({
	view,
	combinedSales,
	createdHypercerts,
}: {
	view: "created" | "supported" | "organizations";
	combinedSales: CombinedSale[];
	createdHypercerts: Hypercert[];
}) => {
	return (
		<section className="mt-2 flex w-full flex-1 flex-col gap-6">
			<span className="ml-4 flex items-center gap-4 font-baskerville font-bold text-3xl">
				{view === "created" ? (
					<Sparkle className="text-primary" size={36} />
				) : view === "supported" ? (
					<HeartHandshake className="text-primary" size={36} />
				) : (
					<Building className="text-primary" size={36} />
				)}
				<span>
					{view === "created"
						? "Created Hypercerts"
						: view === "supported"
						  ? "Supported Hypercerts"
						  : "Organizations"}{" "}
				</span>
			</span>
			{view === "created" ? (
				<CreatedHypercerts hypercerts={createdHypercerts} />
			) : view === "supported" ? (
				<SupportedHypercerts combinedSales={combinedSales} />
			) : (
				<OrganizationsPage />
			)}
		</section>
	);
};

export default Content;
