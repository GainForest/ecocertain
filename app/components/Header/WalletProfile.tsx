"use client";
import { ConnectButton } from "@/components/global/connect-button";
import { SignInButton } from "@/components/global/signin-button";
import UserSheet from "@/components/global/user-sheet";
import EthAvatar from "@/components/ui/eth-avatar";
import { SUPPORTED_CHAINS } from "@/config/wagmi";
import useAccount from "@/hooks/use-account";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const WalletProfile = () => {
	const { address, isConnecting, isConnected, authenticated, chainId } =
		useAccount();

	if (isConnecting)
		return <Loader2 className="mr-2 animate-spin text-primary" />;
	if (!authenticated) return <SignInButton />;
	if (!isConnected) return <ConnectButton />;

	const chain = SUPPORTED_CHAINS.find(
		(supportedChain) => supportedChain.id === chainId,
	);

	return (
		<UserSheet>
			<div
				className={cn(
					"flex items-center rounded-full p-1",
					chain ? "bg-green-500/20" : "bg-red-500/20",
				)}
			>
				<span
					className={cn(
						"mx-3 font-bold font-sans",
						chain
							? "text-green-700 dark:text-green-300"
							: "text-red-700 dark:text-red-300",
					)}
				>
					{chain?.name ?? "Unknown"}
				</span>
				<EthAvatar
					address={address ? (address as `0x${string}`) : "0x0"}
					size={32}
				/>
			</div>
		</UserSheet>
	);
};

WalletProfile.displayName = "WalletProfile";

export { WalletProfile };
