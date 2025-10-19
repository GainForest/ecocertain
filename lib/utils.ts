import { currencyMap } from "@/config/wagmi";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Address } from "viem";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

const INCLUDES_FORWARD_SLASH_AT_START_REGEX = /^\/(.|\n)*$/;
const INCLUDES_FORWARD_SLASH_AT_START = (string: string) =>
  INCLUDES_FORWARD_SLASH_AT_START_REGEX.test(string);

export const getUrl = (path: string) =>
  `${BASE_URL}${!INCLUDES_FORWARD_SLASH_AT_START(path) ? "/" : ""}${path}`;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: Date) {
  const date = new Date(Number(d) * 1000);
  return date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", // "Oct"
      day: "numeric",
    })
    .toUpperCase();
}

export const formatCurrency = (value: number, currencyCode = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(value);
};

export const truncateEthereumAddress = (
  address: `0x${string}`,
  length = 4
): string => {
  if (!address) {
    return "";
  }
  if (address.length <= 2 + length * 2) {
    return address;
  }
  return `${address.substring(0, length + 2)}...${address.substring(
    address.length - length
  )}`;
};

export const isNotNull = <T>(value: T | null): value is T => {
  return value !== null;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isValidEthereumAddress = (address: string) =>
  /^0x[a-fA-F0-9]{40}$/.test(address);

export function typeCastApiResponseToBigInt(
  value: unknown
): bigint | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return BigInt(value);
  }
  return undefined;
}

export function bigintToFormattedDate(timestamp: bigint): string {
  // Convert bigint to number
  const milliseconds = Number(timestamp) * 1000;
  const date = new Date(milliseconds);

  // Define options for formatting
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  // Format the date using toLocaleDateString
  return date.toLocaleDateString("en-GB", options);
}

export const convertCurrencyPriceToUSD = async (
  currency: string,
  tokens: bigint
): Promise<null | number> => {
  const weiFactor = BigInt(10 ** 18);
  const precision = 4;
  const precisionMultiplier = BigInt(10 ** precision);

  const tokensInNumber =
    Number((tokens * precisionMultiplier) / weiFactor) /
    Number(precisionMultiplier);

  const currencyDetails = currencyMap[currency as `0x${string}`];
  if (currencyDetails) {
    const pricePerToken = await currencyDetails.usdPriceFetcher();
    return tokensInNumber * pricePerToken;
  }
  return null;
};

export const formatDecimals = (value: number, maxDecimals?: number) => {
  maxDecimals = maxDecimals ?? 2;
  return Math.floor(value * 10 ** maxDecimals) / 10 ** maxDecimals;
};

export const getValueFromSearchParams = <T extends string>(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  defaultValue: T,
  validValues: T[]
): T => {
  if (key in searchParams) {
    if (typeof searchParams[key] === "string") {
      if (validValues.includes(searchParams[key] as T))
        return searchParams[key] as T;
    }
    if (Array.isArray(searchParams[key])) {
      for (const value of searchParams[key]) {
        if (validValues.includes(value as T)) return value as T;
      }
    }
  }
  return defaultValue;
};

// balances.ts
import { createPublicClient, http, formatUnits } from 'viem'
import { mainnet, polygon, base, celo, arbitrum } from 'viem/chains'
import { erc20Abi } from 'viem'
import { symbol } from "zod";

// 1) Define which chains are "trade-supported" vs "view-only"
export const TRADE_SUPPORTED = new Set([mainnet.id, base.id, arbitrum.id, celo.id]) // example
export const VIEW_ONLY_CHAINS = [polygon]           

// 2) Make read-only public clients (no wallet needed)
const clients = {
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http('https://eth.llamarpc.com') }),
  [arbitrum.id]: createPublicClient({ chain: arbitrum, transport: http('https://arb1.arbitrum.io/rpc')}),
  // [polygon.id]: createPublicClient({ chain: polygon, transport: http('https://polygon.drpc.org') }),
  // [base.id]:    createPublicClient({ chain: base,    transport: http('https://base.llamarpc.com') }),
  [celo.id]:    createPublicClient({ chain: celo,    transport: http('https://forno.celo.org') }),
}

// 3) Token lists you care about per chain (you can expand this)
const TOKENS: Record<number, Array<{ symbol: string; address: `0x${string}`; decimals?: number }>> = {
  [mainnet.id]: [
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { symbol: 'DAI',  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  ],
  [arbitrum.id]: [
    { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'}
  ],
  [celo.id]: [
    { symbol: 'USDC', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a' },
  ],
}

// 4) Helpers to read native + ERC20
export async function getNativeBalance(chainId: keyof typeof clients , address: `0x${string}`) {
  const client = clients[chainId]
  const value = await client.getBalance({ address })
  return value // bigint in wei
}

export async function getErc20Balances(chainId: keyof typeof clients, address: `0x${string}`) {
  const client = clients[chainId]
  const list = TOKENS[chainId] ?? []
  const out: Array<{ symbol: string; value: string }> = []

  for (const t of list) {
    const [raw, decimals] = await Promise.all([
      client.readContract({ address: t.address, abi: erc20Abi, functionName: 'balanceOf', args: [address] }) as Promise<bigint>,
      t.decimals
        ? Promise.resolve(t.decimals)
        : client.readContract({ address: t.address, abi: erc20Abi, functionName: 'decimals' }) as Promise<number>,
    ])
    out.push({ symbol: t.symbol, value: formatUnits(raw, decimals) })
  }
  return out
}

// 5) Single function to collect a simple “portfolio view” across specific chains
export async function getCrossChainPortfolio(address: `0x${string}`) {
  const chains = [mainnet, celo, arbitrum] // read from both supported + view-only
  const results = await Promise.all(chains.map(async (c) => {
    const [native, erc20s] = await Promise.all([
      getNativeBalance(c.id, address),
      getErc20Balances(c.id, address),
    ])
    return {
      chainId: c.id,
      chainName: c.name,
      supportedForTrading: TRADE_SUPPORTED.has(c.id as 1 | 8453),
      native: native, 
      erc20s,
    }
  }))
  return results
}
