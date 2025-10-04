import { SUPPORTED_CHAINS } from "@/config/wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useCallback } from "react";
import { useConnect } from "wagmi";

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

  const handleConnect = useCallback(
    async (options?: OpenOptions) => {
      if (options?.view === undefined || options.view === "Connect") {
        const connector = connectors.find((connector) =>
          connector.name.toLowerCase().includes("farcaster")
        );
        if (!connector) throw new Error("Injected connector not found");
        try {
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
    },
    [connect, connectors, open]
  );

  return { open: handleConnect, close };
};

export default useWalletConnectionModal;
