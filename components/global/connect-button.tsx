"use client";
import useWalletConnectionModal from "@/hooks/use-wallet-connection-modal";

import { Button } from "@/components/ui/button";

const ConnectButton = () => {
	const { open } = useWalletConnectionModal();
	return <Button onClick={() => open()}>Connect Wallet</Button>;
};
ConnectButton.displayName = "ConnectButton";

export { ConnectButton };
