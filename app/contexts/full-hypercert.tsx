"use client";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { createContext, useContext } from "react";

const FullHypercertContext = createContext<FullHypercert | null>(null);

export const FullHypercertProvider = ({
	value,
	children,
}: {
	value: FullHypercert;
	children: React.ReactNode;
}) => {
	const nonSerializedFullHypercert: FullHypercert = {
		...value,
		totalUnits: BigInt(value.totalUnits),
		unitsForSale: BigInt(value.unitsForSale),
		creationBlockTimestamp: BigInt(value.creationBlockTimestamp),
		metadata: {
			...value.metadata,
			work: {
				...value.metadata.work,
				...(value.metadata.work.from
					? { from: BigInt(value.metadata.work.from) }
					: {}),
				...(value.metadata.work.to
					? { to: BigInt(value.metadata.work.to) }
					: {}),
			},
		},
		orders: value.orders.map((order) => ({
			...order,
			price: BigInt(order.price),
		})),
		sales: value.sales.map((sale) => ({
			...sale,
			unitsBought: BigInt(sale.unitsBought),
			currencyAmount: BigInt(sale.currencyAmount),
			creationBlockTimestamp: BigInt(sale.creationBlockTimestamp),
		})),
		attestations: value.attestations.map((attestation) => ({
			...attestation,
			creationBlockTimestamp: BigInt(attestation.creationBlockTimestamp),
		})),
	};
	return (
		<FullHypercertContext.Provider value={nonSerializedFullHypercert}>
			{children}
		</FullHypercertContext.Provider>
	);
};

const useFullHypercert = () => {
	const fullHypercert = useContext(FullHypercertContext);
	if (!fullHypercert) {
		throw new Error(
			"useFullHypercert can only be used within a FullHypercertProvider",
		);
	}
	return fullHypercert;
};

export default useFullHypercert;
