import "server-only";

// DeFiLlama chain slugs for the chains we accept donations on. Stablecoins are
// valued at $1 and never reach this map, so we only need chains with volatile
// tokens (CELO, native ETH).
const CHAIN_SLUGS: Record<number, string> = {
	42220: "celo",
	10: "optimism",
};

/**
 * USD price of `address` on `chainId` at (approximately) `timestampSeconds`.
 *
 * Uses DeFiLlama's historical endpoint, which is keyed by timestamp + token and
 * is effectively immutable for any timestamp in the past — so we cache the fetch
 * indefinitely. The timestamp is rounded to the hour to maximise cache reuse
 * across sales that happened close together.
 *
 * Returns null if the chain/token isn't supported or the lookup fails; callers
 * decide how to handle a miss.
 */
export const getHistoricalUSDPrice = async (
	chainId: number,
	address: string,
	timestampSeconds: number,
): Promise<number | null> => {
	const slug = CHAIN_SLUGS[chainId];
	if (!slug || !timestampSeconds) return null;

	const hour = Math.floor(timestampSeconds / 3600) * 3600;
	const coinKey = `${slug}:${address}`;
	const url = `https://coins.llama.fi/prices/historical/${hour}/${coinKey}`;

	try {
		// Immutable historical data — cache forever.
		const res = await fetch(url, { next: { revalidate: false } });
		if (!res.ok) return null;
		const json = (await res.json()) as {
			coins?: Record<string, { price?: number }>;
		};
		// DeFiLlama echoes the key back with its own casing, so match case-insensitively.
		const coins = json.coins ?? {};
		const match =
			coins[coinKey] ??
			Object.entries(coins).find(
				([k]) => k.toLowerCase() === coinKey.toLowerCase(),
			)?.[1];
		return match?.price ?? null;
	} catch {
		return null;
	}
};
