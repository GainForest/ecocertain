import { JsonRpcProvider } from "ethers";
import type { PublicClient } from "viem";

import React from "react";
import { usePublicClient } from "wagmi";
import { getRpcUrlForChain } from "@/config/wagmi";

export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient;
  if (!chain || !transport) return undefined;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new JsonRpcProvider(getRpcUrlForChain(chain.id), network);
}

/** Hook to convert a viem Public Client to an ethers.js Provider. */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId });
  return React.useMemo(() => {
    if (publicClient === undefined) return undefined;
    return publicClientToProvider(publicClient);
  }, [publicClient]);
}
