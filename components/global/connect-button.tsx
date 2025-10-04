"use client";
import { useWeb3Modal } from "@web3modal/wagmi/react";

import { Button } from "@/components/ui/button";

const ConnectButton = () => {
	const { open } = useWeb3Modal();
	return <Button onClick={() => open()}>Connect Wallet</Button>;
};
ConnectButton.displayName = "ConnectButton";

export { ConnectButton };
