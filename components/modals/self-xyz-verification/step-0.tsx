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
import { SiAppstore, SiGoogleplay } from "@icons-pack/react-simple-icons";
import { useLogin } from "@privy-io/react-auth";
import { QrCode } from "lucide-react";
import Link from "next/link";
import SelfXYZVerificationStep1 from "./step-1";

const StepListItem = ({
	children,
	stepIndex,
	title,
}: {
	children: React.ReactNode;
	stepIndex: number;
	title: string;
}) => {
	return (
		<div className="flex items-start gap-2 py-1">
			<div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary text-sm">
				{stepIndex}
			</div>
			<div className="flex w-full flex-col">
				<div className="font-bold">{title}</div>
				<div className="w-full text-muted-foreground text-sm">{children}</div>
			</div>
		</div>
	);
};

const SelfXYZVerificationStep0 = () => {
	const { address, isConnected } = useAccount();
	const { login } = useLogin();
	const { pushModalByVariant } = useModal();

	const handleContinue = () => {
		pushModalByVariant({
			id: "self-xyz-verification-step-1",
			content: <SelfXYZVerificationStep1 />,
		});
	};

	return (
		<ModalContent className="font-sans">
			<ModalHeader>
				<ModalTitle>Verify yourself</ModalTitle>
				<ModalDescription>How does verification work?</ModalDescription>
			</ModalHeader>

			{/* Content starts here */}
			<div className="divide-y divide-border/50">
				{/* Step 1: Login status */}
				<StepListItem stepIndex={1} title="Login to your account">
					{isConnected && address && (
						<span>
							Status:{" "}
							<span className="font-medium text-green-600">Connected</span>
						</span>
					)}
					{!isConnected || !address ? (
						<>
							<span>Get started by logging in to your account</span>
							<Button className="mt-1 w-full" onClick={login}>
								Login
							</Button>
						</>
					) : null}
				</StepListItem>

				{/* Step 2: Install the app */}
				<StepListItem stepIndex={2} title="Install the Self app">
					<div className="flex w-full items-center gap-2">
						<p>
							Download and install the <b>Self</b> app on your phone.
						</p>
						<div className="flex items-center gap-1">
							<Link
								className="group/app-store flex-1"
								href="https://apps.apple.com/us/app/self-zk/id6478563710"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button
									variant="secondary"
									className="w-full group-hover/app-store:bg-primary/10 group-hover/app-store:text-primary"
								>
									<SiAppstore className="size-4" />
									{/* App Store */}
								</Button>
							</Link>
							<Link
								className="group/play-store flex-1"
								href="https://play.google.com/store/apps/details?id=com.proofofpassportapp&pli=1"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button
									variant="secondary"
									className="w-full group-hover/play-store:bg-primary/10 group-hover/play-store:text-primary"
								>
									<SiGoogleplay className="size-4" />
									{/* Play Store */}
								</Button>
							</Link>
						</div>
					</div>
				</StepListItem>

				{/* Step 3: Set up the app */}
				<StepListItem stepIndex={3} title="Set up the Self app">
					<div>
						Open the Self app and verify your passport to complete your identity
						setup. This is required for sybil resistance and privacy-preserving
						verification.
					</div>
				</StepListItem>

				{/* Step 4: Scan QR after clicking Get Started */}
				<StepListItem stepIndex={4} title="Scan the QR code">
					Click the button below to get started. Scan the QR code and follow the
					instructions on the next screen to{" "}
					<b className="text-foreground">share only your nationality</b> with us
					to prove your humanity.
				</StepListItem>
			</div>
			{/* Content ends here */}

			<ModalFooter>
				<Button disabled={!isConnected || !address} onClick={handleContinue}>
					<QrCode className="mr-2 size-5" />
					Continue
				</Button>
			</ModalFooter>
		</ModalContent>
	);
};

export default SelfXYZVerificationStep0;
