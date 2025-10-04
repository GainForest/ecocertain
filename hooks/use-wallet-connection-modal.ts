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
      console.log("connectors:", connectors);
      console.log("farcaster" in window ? window.farcaster : "no farcaster");
      console.log(JSON.stringify(window));

      open(options);
    },
    [connectAsync, connectors, open]
  );

  return { open: handleConnect, close };
};

export default useWalletConnectionModal;
