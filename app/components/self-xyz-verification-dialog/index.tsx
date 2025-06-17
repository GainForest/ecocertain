"use client";

import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import SelfQRcodeWrapper, { SelfAppBuilder } from "@selfxyz/qrcode";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useAccount } from "wagmi";

export function addressToUuid(address: string): string {
	const hex = Buffer.from(address, "utf8")
		.toString("hex")
		.padEnd(32, "0")
		.slice(0, 32);
	const chars = hex.split("");
	chars[12] = "4";
	chars[16] = ["8", "9", "a", "b"][Number.parseInt(chars[16], 16) % 4];
	const finalHex = chars.join("");

	return [
		finalHex.slice(0, 8),
		finalHex.slice(8, 12),
		finalHex.slice(12, 16),
		finalHex.slice(16, 20),
		finalHex.slice(20, 32),
	].join("-");
}

const SelfVerifier = ({
	address,
	onSuccess,
}: {
	address: string | undefined;
	onSuccess?: () => void;
}) => {
	if (!address)
		return (
			<div className="flex h-20 w-full items-center justify-center">
				<Loader2 className="size-4 animate-spin" />
			</div>
		);

	const userId = addressToUuid(address);

	const selfApp = new SelfAppBuilder({
		appName: "Ecocertain",
		scope: "gainforest",
		endpoint: "https://gainforest-self-xyz.vercel.app/api/self-xyz/verify",
		userId,
		disclosures: {
			nationality: true,
		},
	}).build();

	return (
		<SelfQRcodeWrapper
			selfApp={selfApp}
			onSuccess={onSuccess ?? (() => {})}
			size={300}
		/>
	);
};

function SelfXYZVerificationDialog({ trigger }: { trigger: React.ReactNode }) {
	const { address } = useAccount();
	const [isVerified, setIsVerified] = useState(false);

	const onSuccess = () => {
		console.log("Verification successful!");
		setIsVerified(true);
	};

	return (
		<>
			<Dialog>
				<DialogTrigger asChild>{trigger}</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Verify Your Identity</DialogTitle>
						<DialogDescription>
							Scan this QR code with the Self app to verify your identity
						</DialogDescription>
					</DialogHeader>
					<SelfVerifier address={address} onSuccess={onSuccess} />
				</DialogContent>
			</Dialog>
		</>
	);
}

export default SelfXYZVerificationDialog;
