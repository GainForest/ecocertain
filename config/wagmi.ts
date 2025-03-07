import getPriceFeed from "@/lib/pricefeed";
import { walletConnect } from "wagmi/connectors";

import { cookieStorage, createConfig, createStorage } from "wagmi";
import { BASE_URL } from "./endpoint";
import { sepolia, celo, mainnet } from "viem/chains";
import { RAW_TOKENS_CONFIG, TokensConfig } from "./raw-tokens";
import { HttpTransport, fallback, http } from "viem";
// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

const DEV_CHAINS = [sepolia] as const;
const PROD_CHAINS = [celo] as const;
export const SUPPORTED_CHAINS =
  process.env.NEXT_PUBLIC_DEPLOY_ENV === "production"
    ? PROD_CHAINS
    : DEV_CHAINS;

export const getUSDPeggedValue = () => new Promise<number>((res) => res(1));
export const getUSDByCurrencyAddress = async (
  currencyAddress: `0x${string}`
): Promise<number> => {
  const { usdPrice } = await getPriceFeed(currencyAddress);
  if (usdPrice) {
    return usdPrice;
  }
  throw new Error("Failed to fetch USD price");
};

const normalizeTokensConfig = (
  config: TokensConfig<"raw">
): TokensConfig<"normalized"> => {
  return Object.fromEntries(
    Object.entries(config).map(([chainId, tokens]) => {
      return [
        chainId,
        tokens.map((token) => {
          const address = token.address.toLowerCase() as `0x${string}`;
          const isUSDPegged = token.isUSDPegged ?? true;
          return {
            ...token,
            address: token.address.toLowerCase(),
            usdPriceFetcher:
              token.usdPriceFetcher ?? isUSDPegged
                ? getUSDPeggedValue
                : () => getUSDByCurrencyAddress(address),
            isUSDPegged,
          };
        }),
      ];
    })
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

const metadata = {
  name: "Ecocertain",
  description: "Fund impactful regenerative projects",
  url: BASE_URL, // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/46801808"],
};

const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY || "";
const infuraRPCEndpoint = `https://mainnet.infura.io/v3/${infuraKey}`;

export const getRpcUrlForChain = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return infuraRPCEndpoint
    case sepolia.id:
      return infuraRPCEndpoint
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};

// Create wagmiConfig
// Create wagmiConfig
export const config = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  pollingInterval: 2_000,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: SUPPORTED_CHAINS.reduce((acc, chain) => {
    const urls = [getRpcUrlForChain(chain.id)];
    // @ts-expect-error
    acc[chain.id] = fallback([...urls.map((url) => http(url)), http()]);
    return acc;
  }, {} as Record<number, HttpTransport>),
});
