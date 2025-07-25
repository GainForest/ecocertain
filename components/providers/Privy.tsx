"use client";

import { SUPPORTED_CHAINS, config } from "@/config/wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { celo } from "viem/chains";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

export default function PrivyConfigProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
			clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? ""}
			config={{
				// Create embedded wallets for users who don't have a wallet
				embeddedWallets: {
					ethereum: {
						createOnLogin: "users-without-wallets",
					},
				},
				supportedChains: [...SUPPORTED_CHAINS],
				defaultChain: SUPPORTED_CHAINS[0],
			}}
		>
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={config}>{children}</WagmiProvider>
			</QueryClientProvider>
		</PrivyProvider>
	);
}
