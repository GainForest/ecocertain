import { celo, optimism, sepolia } from "viem/chains";

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
      address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
      decimals: 6,
    },
    {
      symbol: "USDC",
      address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
      decimals: 6,
    },
    {
      symbol: "USDGLO",
      address: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
      decimals: 18,
      isUSDPegged: true,
    },
  ],
  [optimism.id]: [
    {
      symbol: "USDC",
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      isUSDPegged: true,
    },
    {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isUSDPegged: false,
    },
  ],
};
