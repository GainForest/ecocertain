"use client";

import { RAW_TOKENS_CONFIG } from "@/config/raw-tokens";
import getPriceFeed, { currencyAddressToSymbolMap } from "@/lib/pricefeed";
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
		toUSD: (currency: `0x${string}`, amount: number) => number | null;
		fromUSD: (currency: `0x${string}`, amount: number) => number | null;
	};
};

type PriceFeedContext = PriceFeedContextCatalog[keyof PriceFeedContextCatalog];

const priceFeedContext = createContext<PriceFeedContext | null>(null);
const currencies = Array.from(currencyAddressToSymbolMap.keys());

export const PriceFeedProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["price-feed"],
		queryFn: () => {
			return Promise.all(currencies.map((c) => getPriceFeed(c)));
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
			toUSD: (currency, amount) => {
				const currencyIndex = currencies.indexOf(currency);
				if (currencyIndex === -1) {
					return null;
				}
				// Find decimals for this currency
				let decimals = 18; // default
				for (const chainId in RAW_TOKENS_CONFIG) {
					const token = RAW_TOKENS_CONFIG[chainId].find(
						(t) => t.address.toLowerCase() === currency.toLowerCase(),
					);
					if (token) {
						decimals = token.decimals;
						break;
					}
				}
				// amount is in raw units (wei), so convert to number of tokens
				const amountInTokens = amount / 10 ** decimals;
				const priceInUSD = data[currencyIndex].usdPrice;
				return priceInUSD === null ? null : priceInUSD * amountInTokens;
			},
			fromUSD: (currency, amount) => {
				const currencyIndex = currencies.indexOf(currency);
				if (currencyIndex === -1) {
					return null;
				}
				// Find decimals for this currency
				let decimals = 18; // default
				for (const chainId in RAW_TOKENS_CONFIG) {
					const token = RAW_TOKENS_CONFIG[chainId].find(
						(t) => t.address.toLowerCase() === currency.toLowerCase(),
					);
					if (token) {
						decimals = token.decimals;
						break;
					}
				}
				const priceInUSD = data[currencyIndex].usdPrice;
				if (priceInUSD === null) return null;
				// amount is in USD, so convert to number of tokens, then to raw units
				const amountInTokens = amount / priceInUSD;
				return amountInTokens * 10 ** decimals;
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
