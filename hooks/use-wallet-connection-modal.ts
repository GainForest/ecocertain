import { SUPPORTED_CHAINS } from "@/config/wagmi";
import { useQuery } from "@tanstack/react-query";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useCallback } from "react";
import { useConnect } from "wagmi";
import { sdk } from "@farcaster/frame-sdk";

// Hardcoding Open Options here since it's not exported from the library.
// Update this type if library is updated.
export type OpenOptions = {
  view:
    | "Account"
    | "Connect"
    | "Networks"
    | "ApproveTransaction"
    | "OnRampProviders";
};

const useWalletConnectionModal = () => {
  const { open, close } = useWeb3Modal();
  const { connectors, connect, status } = useConnect();
  const { data: isFarcasterAvailable } = useQuery({
    queryKey: ["is-farcaster-available", window?.location.href],
    queryFn: async () => {
      const context = await sdk.context;
      return !!context;
    },
    refetchInterval: 60 * 1000, // 1 minute
    enabled: typeof window !== "undefined",
  });

  const handleConnect = async (options?: OpenOptions) => {
    if (
      isFarcasterAvailable &&
      (options?.view === undefined || options.view === "Connect")
    ) {
      console.log("All connectors:", connectors);
      const connector = connectors.find((connector) =>
        connector.name.toLowerCase().includes("farcaster")
      );
      try {
        if (!connector) throw new Error("Farcaster connector not found");
        connect({
          connector: connector,
          chainId: SUPPORTED_CHAINS[0].id,
        });
        return;
      } catch (error) {
        console.error("Connecting with Farcaster failed", error);
      }
    }

    open(options);
  };

  return { open: handleConnect, close };
};

export default useWalletConnectionModal;
