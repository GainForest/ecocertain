"use client";
import type { Hypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { createContext, useContext } from "react";

const HypercertContext = createContext<Hypercert | null>(null);

export const HypercertProvider = ({
	value,
	children,
}: {
	value: Hypercert;
	children: React.ReactNode;
}) => {
	const nonSerializedHypercert: Hypercert = {
		...value,
		totalUnits: BigInt(value.totalUnits),
		unitsForSale: value.unitsForSale ? BigInt(value.unitsForSale) : undefined,
	};
	return (
		<HypercertContext.Provider value={nonSerializedHypercert}>
			{children}
		</HypercertContext.Provider>
	);
};

const useHypercert = () => {
	const hypercert = useContext(HypercertContext);
	if (!hypercert) {
		throw new Error("useHypercert can only be used within a HypercertProvider");
	}
	return hypercert;
};

export default useHypercert;
