import React from "react";

import type { Hypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { CircleAlert } from "lucide-react";
import Card from "./card";

const NoCreatedHypercerts = () => {
	return (
		<div className="flex flex-col items-center gap-4 pt-6 text-center md:px-20">
			<CircleAlert className="text-beige-muted-foreground/50" size={40} />
			<p className="px-8 text-beige-muted-foreground">
				Hypercerts that you create appear here.
			</p>
		</div>
	);
};

const CreatedHypercerts = ({ hypercerts }: { hypercerts: Hypercert[] }) => {
	if (hypercerts.length === 0) return <NoCreatedHypercerts />;
	const newestSortedHypercerts = hypercerts.sort((a, b) =>
		Number(b.creationBlockTimestamp - a.creationBlockTimestamp),
	);
	return (
		<div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
			{newestSortedHypercerts.map((hypercert) => {
				return <Card key={hypercert.hypercertId} hypercert={hypercert} />;
			})}
		</div>
	);
};

export default CreatedHypercerts;
