import { Chain } from "viem";

export const getSafeChainAbbreviation = (chain: Chain | undefined) => {
  if (!chain) {
    return "";
  }
  switch (chain.id) {
    case 11155111:
      return "sep";
    case 8453:
      return "base";
    case 10:
      return "oeth";
    case 84532:
      return "basesep";
    case 42220:
      return "celo";
    case 42161:
      return "arb1";
    default:
      return chain.name;
  }
};

const generateSafeAppLink = (
  chain: Chain | undefined,
  safeAddress: `0x${string}`
) => {
  if (!chain) {
    return "";
  }
  return `https://app.safe.global/home?safe=${getSafeChainAbbreviation(
    chain
  )}:${safeAddress}`;
};

export default generateSafeAppLink;
