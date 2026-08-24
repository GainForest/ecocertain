import { currencyDetailsMap } from "@/config/tokens";
import { unstable_cache } from "next/cache";
import { getHistoricalUSDPrice } from "./historical-price";

export type RaisedSale = {
	currency: string;
	currencyAmount: bigint;
	creationBlockTimestamp?: bigint;
};

/**
 * Total USD raised across `sales`, valuing each donation at the token's USD
 * price *at the time that donation was made* rather than the current price.
 *
 * Stablecoins are valued at $1. Volatile tokens (CELO, ETH) are valued at their
 * historical price at the sale's block timestamp. If a historical price can't be
 * resolved, that sale is skipped rather than valued at the wrong (current) price.
 */
export const computeTotalRaisedInUSD = async (
	sales: RaisedSale[],
): Promise<number> => {
	let total = 0;
	for (const sale of sales) {
		const details = currencyDetailsMap[sale.currency.toLowerCase()];
		if (!details) continue;

		const amountInTokens = Number(sale.currencyAmount) / 10 ** details.decimals;
		if (!Number.isFinite(amountInTokens) || amountInTokens === 0) continue;

		if (details.isUSDPegged) {
			total += amountInTokens;
			continue;
		}

		const timestamp = Number(sale.creationBlockTimestamp ?? 0n);
		const priceAtDonation = await getHistoricalUSDPrice(
			details.chainId,
			sale.currency,
			timestamp,
		);
		if (priceAtDonation === null) continue;
		total += amountInTokens * priceAtDonation;
	}
	return total;
};

const signature = (sales: RaisedSale[]) => {
	// Sales are immutable once on-chain, so the total only changes when a new one
	// appears. Key the cache on the count + newest timestamp so it recomputes then
	// and stays cached otherwise.
	const latest = sales.reduce(
		(max, s) =>
			Number(s.creationBlockTimestamp ?? 0n) > max
				? Number(s.creationBlockTimestamp ?? 0n)
				: max,
		0,
	);
	return `${sales.length}:${latest}`;
};

/**
 * Cached wrapper around {@link computeTotalRaisedInUSD}. The result is cached
 * indefinitely and only recomputed when the hypercert gains a new sale.
 */
export const getTotalRaisedInUSD = (
	hypercertId: string,
	sales: RaisedSale[],
): Promise<number> =>
	unstable_cache(
		() => computeTotalRaisedInUSD(sales),
		["total-raised-at-donation-time", hypercertId, signature(sales)],
		{ revalidate: false },
	)();
