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
import type React from "react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function SelfXYZVerificationDialog({ trigger }: { trigger: React.ReactNode }) {
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		// Generate a user ID when the component mounts
		setUserId(uuidv4());
	}, []);

	if (!userId) return null;

	// Create the SelfApp configuration
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
					<SelfQRcodeWrapper
						selfApp={selfApp}
						onSuccess={() => {
							// Handle successful verification
							console.log("Verification successful!");
							// Redirect or update UI
						}}
						size={350}
					/>

					<p className="text-gray-500 text-sm">
						User ID: {userId.substring(0, 8)}...
					</p>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default SelfXYZVerificationDialog;
