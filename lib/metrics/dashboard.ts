import BigNumber from "bignumber.js";

import { TOKENS_CONFIG } from "@/config/tokens";
import { fetchHypercerts } from "@/graphql/hypercerts/queries/hypercerts";
import { getGeoMetrics } from "@/lib/metrics/geo";
import { getTelemetryMetrics } from "@/lib/metrics/telemetry";
import { fetchAttestationCountByPeriod } from "@/graphql/hypercerts/queries/metrics";

type TokenMeta = {
	symbol: string;
	decimals: number;
	usdPriceFetcher: () => Promise<number>;
};

const tokenLookup = new Map<string, TokenMeta>();
for (const tokens of Object.values(TOKENS_CONFIG)) {
	for (const token of tokens) {
		tokenLookup.set(token.address.toLowerCase(), {
			symbol: token.symbol,
			decimals: token.decimals,
			usdPriceFetcher: token.usdPriceFetcher,
		});
	}
}

const SDG_VOLUME_TARGET_USD = 10_000;
const SDG_TRANSACTION_TARGET = 50;

const toSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

const convertAmountToUSD = async (
	currency: string,
	amount: bigint,
): Promise<number | null> => {
	const token = tokenLookup.get(currency.toLowerCase());
	if (!token) {
		return null;
	}
	const price = await token.usdPriceFetcher();
	if (price === null || Number.isNaN(price)) {
		return null;
	}

	const raw = new BigNumber(amount.toString());
	const divisor = new BigNumber(10).pow(token.decimals);
	const tokens = raw.div(divisor);
	return tokens.multipliedBy(price).toNumber();
};

type AggregatedSale = {
	currency: string;
	currencyAmount: bigint;
	buyer: string;
	timestamp: bigint;
};

const flattenSales = (hypercerts: Awaited<ReturnType<typeof fetchHypercerts>>) => {
	const flattened: AggregatedSale[] = [];
	for (const hypercert of hypercerts) {
		for (const sale of hypercert.sales) {
			flattened.push({
				currency: sale.currency,
				currencyAmount: sale.currencyAmount,
				buyer: sale.buyer ?? "0x0",
				timestamp: sale.creationBlockTimestamp ?? 0n,
			});
		}
	}
	return flattened;
};

const sumUSDForSales = async (sales: AggregatedSale[]) => {
	const usdValues = await Promise.all(
		sales.map((sale) => convertAmountToUSD(sale.currency, sale.currencyAmount)),
	);
	return usdValues.reduce(
		(acc, value) => {
			if (value !== null) {
				return {
					total: acc.total + value,
					count: acc.count + 1,
				};
			}
			return acc;
		},
		{ total: 0, count: 0 },
	);
};

export type DashboardMetrics = {
	lastUpdated: string;
	totals: {
		hypercerts: number;
		listedForSale: number;
		totalVolumeUSD: number;
		averageTransactionUSD: number;
		repeatBuyerRate: number;
		repeatBuyerCount: number;
		uniqueBuyerCount: number;
	};
	monthly: {
		onchainTransactions: number;
		minted: number;
		purchases: number;
		evaluations: number;
		volumeUSD: number;
	};
	sdg: {
		transactionVolumeUSD: number;
		volumeTargetUSD: number;
		transactionCount: number;
		transactionTarget: number;
		volumeProgress: number;
		transactionProgress: number;
	};
	geo: Awaited<ReturnType<typeof getGeoMetrics>>;
	engagement: Awaited<ReturnType<typeof getTelemetryMetrics>>;
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
	const nowSeconds = toSeconds(new Date());
	const monthStartSeconds = toSeconds(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

	const [hypercerts, geoMetrics, telemetryMetrics] = await Promise.all([
		fetchHypercerts(),
		getGeoMetrics(),
		getTelemetryMetrics(),
	]);
	const allSales = flattenSales(hypercerts);
	const monthlySales = allSales.filter(
		(sale) => Number(sale.timestamp ?? 0n) >= monthStartSeconds,
	);

	const [monthlyEvaluations, allTimeEvaluations] = await Promise.all([
		fetchAttestationCountByPeriod(BigInt(monthStartSeconds), BigInt(nowSeconds)),
		fetchAttestationCountByPeriod(0n, BigInt(nowSeconds)),
	]);

	const listedForSale = hypercerts.filter(
		(hypercert) => (hypercert.unitsForSale ?? 0n) > 0n,
	).length;

	const mintedThisMonth = hypercerts.filter(
		(hypercert) => Number(hypercert.creationBlockTimestamp) >= monthStartSeconds,
	).length;

	const monthlySalesCount = monthlySales.length;
	const monthlyOnchainTransactions =
		mintedThisMonth + monthlySalesCount + monthlyEvaluations;

	const [monthlyUSD, allTimeUSD] = await Promise.all([
		sumUSDForSales(monthlySales),
		sumUSDForSales(allSales),
	]);

	const uniqueBuyerCounts = new Map<string, number>();
	for (const sale of allSales) {
		const buyer = sale.buyer?.toLowerCase() ?? "0x0";
		uniqueBuyerCounts.set(buyer, (uniqueBuyerCounts.get(buyer) ?? 0) + 1);
	}
	const repeatBuyerCount = Array.from(uniqueBuyerCounts.values()).filter(
		(count) => count > 1,
	).length;
	const repeatBuyerRate =
		uniqueBuyerCounts.size === 0
			? 0
			: repeatBuyerCount / uniqueBuyerCounts.size;

	const averageTransactionUSD =
		allTimeUSD.count === 0 ? 0 : allTimeUSD.total / allTimeUSD.count;

	const totalTransactions =
		hypercerts.length + allSales.length + allTimeEvaluations;

	const volumeProgress = Math.min(
		allTimeUSD.total / SDG_VOLUME_TARGET_USD,
		1,
	);
	const transactionProgress = Math.min(
		totalTransactions / SDG_TRANSACTION_TARGET,
		1,
	);

	return {
		lastUpdated: new Date().toISOString(),
		totals: {
			hypercerts: hypercerts.length,
			listedForSale,
			totalVolumeUSD: Number(allTimeUSD.total.toFixed(2)),
			averageTransactionUSD: Number(averageTransactionUSD.toFixed(2)),
			repeatBuyerRate: Number((repeatBuyerRate * 100).toFixed(2)),
			repeatBuyerCount,
			uniqueBuyerCount: uniqueBuyerCounts.size,
		},
		monthly: {
			onchainTransactions: monthlyOnchainTransactions,
			minted: mintedThisMonth,
			purchases: monthlySalesCount,
			evaluations: monthlyEvaluations,
			volumeUSD: Number(monthlyUSD.total.toFixed(2)),
		},
		sdg: {
			transactionVolumeUSD: Number(allTimeUSD.total.toFixed(2)),
			volumeTargetUSD: SDG_VOLUME_TARGET_USD,
			transactionCount: totalTransactions,
			transactionTarget: SDG_TRANSACTION_TARGET,
			volumeProgress,
			transactionProgress,
		},
		geo: geoMetrics,
		engagement: telemetryMetrics,
	};
};
