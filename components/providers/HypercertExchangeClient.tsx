"use client";

import { useHypercertExchangeClient as useHCExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import type { HypercertExchangeClient } from "@hypercerts-org/marketplace-sdk";
import type React from "react";
import { createContext, useContext } from "react";

type HypercertExchangeClientContextType = HypercertExchangeClient | undefined;

const HypercertExchangeClientContext =
	createContext<HypercertExchangeClientContextType | null>(null);

const HypercertExchangeClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { client } = useHCExchangeClient();
	const hcExchangeClient = client ? client : undefined;

	return (
		<HypercertExchangeClientContext.Provider value={hcExchangeClient}>
			{children}
		</HypercertExchangeClientContext.Provider>
	);
};

export const useHypercertExchangeClient = () => {
	const context = useContext(HypercertExchangeClientContext);
	if (context === null) {
		throw new Error(
			"useHypercertExchangeClient must be used within a HypercertExchangeClientProvider",
		);
	}
	return context;
};

export default HypercertExchangeClientProvider;
