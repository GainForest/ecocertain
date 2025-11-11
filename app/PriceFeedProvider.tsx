"use client";

import { TOKENS_CONFIG } from "@/config/tokens";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";

type PriceFeedContextCatalog = {
	loading: {
		status: "loading";
	};
	error: {
		status: "error";
	};
	ready: {
		status: "ready";
		toUSD: (currencyAddress: `0x${string}`, amount: bigint) => number | null;
		fromUSD: (currencyAddress: `0x${string}`, amount: number) => bigint | null;
	};
};

export type PriceFeedContext =
	PriceFeedContextCatalog[keyof PriceFeedContextCatalog];

const priceFeedContext = createContext<PriceFeedContext | null>(null);
const priceFeedConfigs = Object.values(TOKENS_CONFIG).flatMap((chain) =>
	chain.map((token) => {
		return {
			address: token.address as `0x${string}`,
			decimals: token.decimals,
			usdPriceFetcher: new Promise<number | null>((res) => {
				try {
					token.usdPriceFetcher().then((priceInUSD) => {
						res(priceInUSD);
					});
				} catch (error) {
					res(null);
				}
			}),
		};
	}),
);

export const PriceFeedProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["price-feed"],
		queryFn: () => {
			return Promise.all(
				priceFeedConfigs.map((config) => config.usdPriceFetcher),
			);
		},
	});

	let providerValue: PriceFeedContext = {
		status: "loading",
	};

	if (error) {
		providerValue = {
			status: "error",
		};
	} else if (isLoading) {
		providerValue = {
			status: "loading",
		};
	} else if (data === undefined) {
		providerValue = {
			status: "error",
		};
	} else {
		providerValue = {
			status: "ready",
			toUSD: (currencyAddress, amount) => {
				const priceFeedConfigIndex = priceFeedConfigs.findIndex(
					(config) => config.address === currencyAddress,
				);
				if (priceFeedConfigIndex === -1) {
					return null;
				}

				const priceFeedConfig = priceFeedConfigs[priceFeedConfigIndex];
				const { decimals } = priceFeedConfig;
				// amount is in raw units (wei), so convert to number of tokens
				const PRECISION = 2;
				const amountInTokens = amount / BigInt(10 ** (decimals - PRECISION));
				const priceInUSD = data[priceFeedConfigIndex];
				console.log(
					"amount, amountInTokens, decimals, data ===>",
					amount,
					amountInTokens,
					decimals,
					data,
				);
				return priceInUSD === null
					? null
					: (priceInUSD * Number(amountInTokens)) / 10 ** PRECISION;
			},
			fromUSD: (currencyAddress, amount) => {
				const priceFeedConfigIndex = priceFeedConfigs.findIndex(
					(config) => config.address === currencyAddress,
				);
				if (priceFeedConfigIndex === -1) {
					return null;
				}

				const priceFeedConfig = priceFeedConfigs[priceFeedConfigIndex];
				const { decimals } = priceFeedConfig;
				const priceInUSD = data[priceFeedConfigIndex];
				if (priceInUSD === null) return null;
				// amount is in USD, so convert to number of tokens, then to raw units
				const amountInTokens = amount / priceInUSD;
				return BigInt(amountInTokens * 10 ** decimals);
			},
		};
	}
	return (
		<priceFeedContext.Provider value={providerValue}>
			{children}
		</priceFeedContext.Provider>
	);
};

const usePriceFeed = () => {
	const context = useContext(priceFeedContext);
	if (context === null) {
		throw new Error("usePriceFeed must be used within a PriceFeedProvider");
	}
	return context;
};

export default usePriceFeed;
