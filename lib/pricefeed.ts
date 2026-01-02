import { BASE_URL } from "@/config/endpoint";
import { RAW_TOKENS_CONFIG } from "@/config/raw-tokens";

const currencyAddressToSymbolMap = new Map<`0x${string}`, string>();
for (const chainId in RAW_TOKENS_CONFIG) {
  const tokens = RAW_TOKENS_CONFIG[chainId];
  for (const token of tokens) {
    currencyAddressToSymbolMap.set(
      token.address.toLowerCase() as `0x${string}`,
      token.symbol
    );
  }
}

export { currencyAddressToSymbolMap };

const currencyAddressToPriceFeedIdMap = new Map<string, number>([
  ["0x471ece3750da237f93b8e339c536989b8978a438", 5567], // CELO
  ["0x0000000000000000000000000000000000000000", 1027], // ETH (Optimism native)
]);

type ApiResponse<Symbol extends string> = {
  status: {
    timestamp: string;
    error_code: number;
    error_message: unknown | "SUCCESS";
    elapsed: string;
    credit_count: number;
  };
  data?: {
    symbol: Symbol;
    id: string;
    name: string;
    amount: number;
    last_updated: number;
    quote: {
      cryptoId: number;
      symbol: string;
      price: number;
      lastUpdated: number;
    }[];
  };
};

const getPriceFeed = async (currencyAddress: `0x${string}`) => {
  const normalizedCurrencyAddress = currencyAddress.toLowerCase();
  const priceFeedId = currencyAddressToPriceFeedIdMap.get(
    normalizedCurrencyAddress
  );
  const symbol = currencyAddressToSymbolMap.get(
    normalizedCurrencyAddress as `0x${string}`
  );
  if (!priceFeedId || !symbol) {
    return { usdPrice: null };
  }

  let priceFeedApiUrl = `/api/price-conversion?id=${priceFeedId}&amount=1&convert_id=2781`;

  if (typeof window === "undefined") {
    priceFeedApiUrl = `${BASE_URL}${priceFeedApiUrl}`;
  }

  const response = await fetch(priceFeedApiUrl);
  const data: ApiResponse<typeof symbol> = await response.json();
  return { usdPrice: data?.data?.quote[0]?.price ?? null };
};

export default getPriceFeed;
