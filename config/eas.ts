export const HYPERCERT_ATTESTATION_SCHEMA =
  "uint256 chain_id,address contract_address,uint256 token_id,string title,string description,string[] sources" as const;

export const EAS_CONFIGS = [
  {
    chainId: 42220, // Celo
    explorerUrl: "https://celo.easscan.org",
    graphqlUrl: "https://celo.easscan.org/graphql",
    easContractAddress: "0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92",
    schemaUID:
      "0x48e3e1be1e08084b408a7035ac889f2a840b440bbf10758d14fb722831a200c3",
  },
] as const;

export const getEASConfig = (chainId: number) => {
  return EAS_CONFIGS.find((config) => config.chainId === chainId);
};

export type EASConfig = (typeof EAS_CONFIGS)[number];
