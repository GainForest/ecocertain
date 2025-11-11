import { currencyMap } from "@/config/tokens";
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
