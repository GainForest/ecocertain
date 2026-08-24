import getPriceFeed from "@/lib/pricefeed";
import { RAW_TOKENS_CONFIG, TokensConfig } from "./raw-tokens";

export const getUSDPeggedValue = () => new Promise<number>((res) => res(1));

export const getUSDByCurrencyAddress = async (
	currencyAddress: `0x${string}`,
): Promise<number> => {
	const { usdPrice } = await getPriceFeed(currencyAddress);
	if (usdPrice) {
		return usdPrice;
	}
	throw new Error("Failed to fetch USD price");
};

const normalizeTokensConfig = (
	config: TokensConfig<"raw">,
): TokensConfig<"normalized"> => {
	return Object.fromEntries(
		Object.entries(config).map(([chainId, tokens]) => {
			return [
				chainId,
				tokens.map((token) => {
					const address = token.address as `0x${string}`;
					const isUSDPegged = token.isUSDPegged ?? true;
					return {
						...token,
						address: token.address,
						usdPriceFetcher:
							token.usdPriceFetcher ??
							(isUSDPegged
								? getUSDPeggedValue
								: () => getUSDByCurrencyAddress(address)),
						isUSDPegged,
					};
				}),
			];
		}),
	);
};

export const TOKENS_CONFIG: TokensConfig<"normalized"> =
	normalizeTokensConfig(RAW_TOKENS_CONFIG);

export const currencyMap: Record<
	`0x${string}`,
	{
		symbol: string;
		chainId: number;
		usdPriceFetcher: () => Promise<number>;
	}
> = {};

for (const chainId in TOKENS_CONFIG) {
	const tokens = TOKENS_CONFIG[chainId];
	for (const token of tokens) {
		currencyMap[token.address as `0x${string}`] = {
			symbol: token.symbol,
			chainId: Number(chainId),
			usdPriceFetcher: token.usdPriceFetcher,
		};
	}
}

// Address (lowercased) -> details needed to value a sale, including at a past
// point in time. Keyed lowercase because on-chain sale currency addresses may
// come back in a different case than the checksummed config addresses.
export const currencyDetailsMap: Record<
	string,
	{
		symbol: string;
		chainId: number;
		decimals: number;
		isUSDPegged: boolean;
	}
> = {};

for (const chainId in TOKENS_CONFIG) {
	const tokens = TOKENS_CONFIG[chainId];
	for (const token of tokens) {
		currencyDetailsMap[token.address.toLowerCase()] = {
			symbol: token.symbol,
			chainId: Number(chainId),
			decimals: token.decimals,
			isUSDPegged: token.isUSDPegged,
		};
	}
}
