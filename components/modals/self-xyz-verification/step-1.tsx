"use client";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import {
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal/modal";
import useAccount from "@/hooks/use-account";
import { useEthersSigner } from "@/hooks/use-ethers-signer";
import { useLogin } from "@privy-io/react-auth";
import { SelfAppBuilder, SelfQRcodeWrapper } from "@selfxyz/qrcode";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowRight,
	ChevronLeft,
	Loader2,
	QrCode,
	RotateCcw,
} from "lucide-react";
import { useState } from "react";
import ErrorModalBody from "../error-body";

type UserData = {
	address: `0x${string}`;
	timestamp: string;
	signature: string;
};

const SelfQRCode = ({
	userData,
	onSuccess,
	onError,
}: {
	userData: UserData;
	onSuccess: () => void;
	onError: () => void;
}) => {
	const selfApp = new SelfAppBuilder({
		appName: "Ecocertain",
		scope: "gainforest",
		endpoint:
			"https://gainforest-self-xyz-creds.vercel.app/api/verify/gainforest",
		endpointType: "https",
		userId: userData.address,
		userIdType: "hex",
		disclosures: {
			nationality: true,
			excludedCountries: [],
		},
		version: 2,
		userDefinedData: JSON.stringify({
			timestamp: userData.timestamp,
			signature: userData.signature,
		}),
	}).build();

	return (
		<SelfQRcodeWrapper
			selfApp={selfApp}
			onError={(error) => {
				console.error("Error verifying self-xyz", error);
				onError();
			}}
			onSuccess={() => {
				console.log("Successfully verified self-xyz");
				onSuccess();
			}}
			size={300}
		/>
	);
};

const SelfXYZVerificationStep1 = () => {
	const { address, isConnected } = useAccount();
	const signer = useEthersSigner();
	const { stack, popModal, hide, clear } = useModal();
	const queryClient = useQueryClient();

	const {
		data: signedUserData,
		isLoading: signing,
		error: signingError,
		refetch: signMessage,
	} = useQuery({
		queryKey: ["self-xyz-verification", address],
		queryFn: async (): Promise<UserData> => {
			const timestamp = Math.floor(new Date().getTime() / 1000);
			const message = `[${timestamp}] Verifying humanity on GainForest`;
			const signature = await signer?.signMessage(message);
			if (!signature) throw new Error("Failed to sign message");
			return {
				address: address as `0x${string}`,
				timestamp: timestamp.toString(),
				signature: signature,
			};
		},
		enabled: false,
		retry: false,
	});

	const handleSignMessage = () => {
		if (!signer) return;
		if (signing) return;
		signMessage();
	};

	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(false);

	const retryVerification = () => {
		setError(false);
		setSuccess(false);
		queryClient.resetQueries({ queryKey: ["self-xyz-verification", address] });
	};

	const handleClose = () => {
		hide();
		clear();
		queryClient.resetQueries({ queryKey: ["self-xyz-verification", address] });
	};

	return (
		<ModalContent className="font-sans">
			<div className="flex items-center gap-2">
				{stack.length > 1 && (
					<Button
						variant="secondary"
						className="h-6 w-6 rounded-full p-1"
						onClick={() => popModal()}
					>
						<ChevronLeft />
					</Button>
				)}
				<ModalHeader>
					<ModalTitle>Verify yourself</ModalTitle>
					<ModalDescription>
						Scan the QR code to verify your humanity.
					</ModalDescription>
				</ModalHeader>
			</div>

			{/* Content starts here */}
			{!(isConnected && address) && (
				<ErrorModalBody
					ctaText="Go back"
					ctaAction={() => {
						popModal();
					}}
				/>
			)}
			{isConnected && address && (
				<>
					{!signedUserData && (
						<div className="mt-2 flex aspect-square w-full flex-col items-center justify-center gap-2 text-balance rounded-lg bg-muted px-4 text-center text-muted-foreground">
							<QrCode className="size-20 text-muted-foreground" />
							<span>
								<span className="font-semibold text-foreground">
									Sign a message
								</span>
								<br />
								to generate the QR code
							</span>
							{signingError && (
								<div className="text-destructive">
									<span>Unable to get your signature.</span>
								</div>
							)}
							<Button
								size={"sm"}
								variant={"default"}
								className="mt-2 rounded-full"
								disabled={signing}
								onClick={handleSignMessage}
							>
								{signing && <Loader2 className="mr-1 size-4 animate-spin" />}
								Sign
								<ArrowRight className="ml-1 size-4" />
							</Button>
						</div>
					)}
					{signedUserData && (
						<SelfQRCode
							userData={signedUserData}
							onSuccess={() => {
								setSuccess(true);
							}}
							onError={() => {
								setError(true);
							}}
						/>
					)}
					{error && (
						<div className="flex w-full items-center justify-center">
							<Button
								size={"sm"}
								variant={"outline"}
								className="mt-2 rounded-full"
								onClick={retryVerification}
							>
								<RotateCcw className="mr-1 size-4" />
								Retry
							</Button>
						</div>
					)}
				</>
			)}

			{/* Content ends here */}
			{success && (
				<ModalFooter>
					<Button onClick={handleClose}>🎉 Yay!</Button>
				</ModalFooter>
			)}
		</ModalContent>
	);
};

export default SelfXYZVerificationStep1;
