"use client";
import useAccount from "@/hooks/use-account";
import { useRouter } from "next/navigation";
import { useEnsName } from "wagmi";

import { mainnet } from "wagmi/chains";

import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

const UserInfo = () => {
	const { address, isConnected } = useAccount();
	const router = useRouter();
	const { data: ensName } = useEnsName({
		chainId: mainnet.id,
		address: address,
	});

	useEffect(() => {
		if (!isConnected) {
			// If not connected, redirect to /reports
			router.push("/reports");
		}
	}, [isConnected, router]);

	return (
		<>
			<section className="flex flex-col gap-4 md:gap-0">
				<h2 className="font-semibold text-xl md:py-6 md:text-2xl">Account</h2>
				<div className="flex flex-col gap-2 md:col-span-2 md:col-start-1 md:mt-2">
					<Label htmlFor="displayName">Display Name</Label>

					<Alert className="max-w-md bg-stone-200">
						<AlertDescription className="truncate">
							{ensName ? ensName : "No ENS name found"}
						</AlertDescription>
					</Alert>
					<small className="text-sm">
						We'll use your ENS name if you have one.
					</small>
				</div>
				<div className="py-4" />
				<div className="flex flex-col gap-2 md:col-span-2 md:col-start-1 md:mt-2">
					<Label htmlFor="address">Wallet Address</Label>
					<Alert className="max-w-md bg-stone-200">
						<AlertDescription className="truncate">
							{address ? address : "No address found"}
						</AlertDescription>
					</Alert>

					<small className="text-sm">
						Your funds are stored on the blockchain here.
					</small>
				</div>
			</section>
			<Separator />
		</>
	);
};

UserInfo.displayName = "UserInfo";

export { UserInfo };
