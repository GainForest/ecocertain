import { BrowserProvider, JsonRpcSigner } from "ethers";
import React from "react";
import type { WalletClient } from "viem";
import { useWalletClient } from "wagmi";

export function walletClientToSigner(walletClient: WalletClient) {
	const { account, chain, transport } = walletClient;
	const network = {
		chainId: chain?.id,
		name: chain?.name,
		ensAddress: chain?.contracts?.ensRegistry?.address,
	};
	const provider = new BrowserProvider(transport, network);

	if (!account || !account.address) {
		throw new Error("Account address is required to create a signer");
	}

	const signer = new JsonRpcSigner(provider, account.address);
	return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
	const { data: walletClient } = useWalletClient({ chainId });
	return React.useMemo(
		() => (walletClient ? walletClientToSigner(walletClient) : undefined),
		[walletClient],
	);
}
