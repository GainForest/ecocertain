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
  const { connectors, connectAsync, status } = useConnect();

  const handleConnect = useCallback(
    async (options?: OpenOptions) => {
      // Try Farcaster connector first (if present and ready)
      const farcasterConnector = connectors.find(
        (connector) =>
          connector.id === "farcaster" ||
          connector.id === "farcaster-miniapp" ||
          connector.name.toLowerCase().includes("farcaster")
      );

      const preferredConnector = farcasterConnector ?? connectors[0];

      if (preferredConnector && preferredConnector.ready) {
        try {
          await connectAsync({ connector: preferredConnector });
          return;
        } catch (err) {
          // Fall through to external wallet modal
        }
      }

      // If Farcaster isn't available/ready or connect failed, open Web3Modal
      open(options);
    },
    [connectAsync, connectors, open]
  );

  return { open: handleConnect, close };
};

export default useWalletConnectionModal;
