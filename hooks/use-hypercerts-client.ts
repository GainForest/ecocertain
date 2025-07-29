"use client";
import { SUPPORTED_CHAINS } from "@/config/wagmi";
import { HypercertClient } from "@hypercerts-org/sdk";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import useAccount from "@/hooks/use-account";

export const useHypercertClient = () => {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const [client, setClient] = useState<HypercertClient>();

  useEffect(() => {
    if (!walletClient || !isConnected) {
      return;
    }

    if (!SUPPORTED_CHAINS.find((chain) => chain.id === walletClient.chain.id)) {
      return;
    }
    setClient(
      new HypercertClient({
        environment:
          process.env.NEXT_PUBLIC_DEPLOY_ENV === "production"
            ? "production"
            : "test",
        // @ts-ignore - wagmi and viem have different typing
        walletClient,
      })
    );
  }, [walletClient, isConnected]);

  return { client };
};
