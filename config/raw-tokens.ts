import { celo, sepolia } from "viem/chains";

export type TokenConfig<Type = "raw" | "normalized"> = {
  symbol: string;
  address: string;
  decimals: number;
} & (Type extends "raw"
  ? {
      isUSDPegged?: boolean;
      usdPriceFetcher?: () => Promise<number>;
    }
  : {
      isUSDPegged: boolean;
      usdPriceFetcher: () => Promise<number>;
    });

export type TokensConfig<Type = "raw" | "normalized"> = Record<
  number,
  Array<TokenConfig<Type>>
>;

export const RAW_TOKENS_CONFIG: TokensConfig<"raw"> = {
  [sepolia.id]: [
    {
      symbol: "LINK",
      address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      decimals: 18,
    },
  ],
  [celo.id]: [
    {
      symbol: "CELO",
      address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
      isUSDPegged: false,
      decimals: 18,
    },
    {
      symbol: "cUSD",
      address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      decimals: 18,
    },
    {
      symbol: "USDT",
      address: "0xb020D981420744F6b0FedD22bB67cd37Ce18a1d5",
      decimals: 6,
    },
    {
      symbol: "USDC",
      address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
      decimals: 6,
    },
  ],
};
