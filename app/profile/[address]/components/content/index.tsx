import type { Hypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { HeartHandshake, Send, Sparkle } from "lucide-react";
import React from "react";
import type { CombinedSale } from "../../page";
import CreatedHypercerts from "./created-hypercerts";
import GitcoinDonations from "./gitcoin-donations";
import SupportedHypercerts from "./supported-hypercerts";

const Content = ({
	view,
	combinedSales,
	createdHypercerts,
}: {
	view: "created" | "supported" | "gitcoin-donations";
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
					<Send className="text-primary" size={36} />
				)}
				<span>
					{view === "created"
						? "Created Hypercerts"
						: view === "supported"
						  ? "Supported Hypercerts"
						  : "Gitcoin Donations"}
				</span>
			</span>
			{view === "created" ? (
				<CreatedHypercerts hypercerts={createdHypercerts} />
			) : view === "supported" ? (
				<SupportedHypercerts combinedSales={combinedSales} />
			) : (
				<GitcoinDonations
					userHypercertIds={createdHypercerts.map((h) => h.hypercertId)}
				/>
			)}
		</section>
	);
};

export default Content;
