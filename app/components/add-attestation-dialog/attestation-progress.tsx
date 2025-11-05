"use client";

import { Button } from "@/components/ui/button";
import { getEASConfig } from "@/config/eas";
import { fetchFullHypercertById } from "@/graphql/hypercerts/queries/hypercerts";
import { cn } from "@/lib/utils";
import type { JsonRpcSigner } from "ethers";
import { motion } from "framer-motion";
import {
	ArrowRight,
	ArrowUpRight,
	Check,
	Circle,
	CircleAlert,
	Info,
	Loader2,
	RotateCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { addAttestation } from "./utils";

type AttestationProgressConfig = {
	title: string;
	description: string;
	isFinalState?: true;
	errorState?: {
		title: string;
		description: string;
	};
};

const attestationProgressConfigKeys = [
	"INITIALIZING",
	"PREPARING",
	"WAITING_TO_SIGN",
	"WAITING_FOR_CONFIRMATION",
	"COMPLETED",
] as const;
type AttestationProgressConfigKey =
	(typeof attestationProgressConfigKeys)[number];

const attestationProgressConfigs: Record<
	AttestationProgressConfigKey,
	AttestationProgressConfig
> = {
	INITIALIZING: {
		title: "Initializing",
		description: "Checking for pre-requisites",
		errorState: {
			title: "Unable to process your request",
			description:
				"Please make sure your wallet is connected to a supported chain, and try again.",
		},
	},
	PREPARING: {
		title: "Preparing",
		description: "Preparing to attest",
		errorState: {
			title: "Unable to process your request",
			description:
				"Something went wrong while getting information about the ecocert. Please try again.",
		},
	},
	WAITING_TO_SIGN: {
		title: "Waiting for signature",
		description: "Please sign the transaction to create your attestation.",
		errorState: {
			title: "Rejected",
			description: "The transaction was rejected.",
		},
	},
	WAITING_FOR_CONFIRMATION: {
		title: "Waiting for confirmation",
		description: "Waiting for the transaction to confirm",
		errorState: {
			title: "Unable to attest",
			description: "The transaction could not be confirmed. Please try again.",
		},
	},
	COMPLETED: {
		title: "Attestation added!",
		description: "Your attestation has been added to the ecocert.",
		isFinalState: true,
	},
};

const PROGESS_CONTAINER_HEIGHT = 300;

const catchError = async <TryReturnType,>(
	tryFn: () => Promise<TryReturnType>,
): Promise<[TryReturnType, null] | [null, Error]> => {
	try {
		const response = await tryFn();
		return [response, null];
	} catch (error) {
		return [null, error as Error];
	}
};

const AttestationProgress = ({
	hypercertId,
	values,
	visible = false,
	setVisible,
	signer,
}: {
	hypercertId: string;
	values: {
		title: string;
		description: string;
		sourceURLs: Array<[string, string | undefined]>;
	};
	visible: boolean;
	setVisible: (visible: boolean) => void;
	signer: JsonRpcSigner | undefined;
}) => {
	const [configKey, setConfigKey] =
		useState<AttestationProgressConfigKey>("INITIALIZING");
	const [error, setError] = useState(false);
	const [blockExplorerUrl, setBlockExplorerUrl] = useState<string | null>(null);

	const { chainId } = useAccount();

	const startTransaction = async () => {
		setError(false);
		setConfigKey("INITIALIZING");
		if (!signer || !chainId) {
			setError(true);
			return;
		}

		const easConfig = getEASConfig(chainId);
		if (!easConfig) {
			setError(true);
			return;
		}

		setConfigKey("PREPARING");
		const [hypercert, hypercertError] = await catchError(
			async () => await fetchFullHypercertById(hypercertId),
		);
		if (hypercertError) {
			setError(true);
			return;
		}
		const attestations = hypercert.attestations;
		const firstAttestationWithSameSchema = attestations.find(
			(attestation) => attestation.schema_uid === easConfig.schemaUID,
		);
		const referencedAttestation = firstAttestationWithSameSchema?.uid;

		const [hcChain, hcContractAddress, hcTokenId] = hypercertId.split("-");

		setConfigKey("WAITING_TO_SIGN");

		const [transaction, transactionError] = await catchError(
			async () =>
				await addAttestation(signer, chainId, {
					referencedAttestation,
					chainId: hcChain,
					contractAddress: hcContractAddress,
					tokenId: hcTokenId,
					title: values.title,
					description: values.description,
					sourceURLs: values.sourceURLs,
				}),
		);
		if (transactionError) {
			setError(true);
			return;
		}

		setConfigKey("WAITING_FOR_CONFIRMATION");
		const [receipt, receiptError] = await catchError(
			async () => await transaction.wait(),
		);
		if (receiptError) {
			setError(true);
			return;
		}

		const attestationUID = receipt;
		setBlockExplorerUrl(
			`${easConfig.explorerUrl}/attestation/view/${attestationUID}`,
		);
		// Complete!
		setConfigKey("COMPLETED");
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(startTransaction): startTransaction is not something we want to listen for changes here
	useEffect(() => {
		if (!visible) {
			setConfigKey("INITIALIZING");
			setError(false);
			return;
		}
		startTransaction();
	}, [visible]);

	const statusListRef = useRef<HTMLDivElement>(null);
	const [statusListYTranslation, setConfigKeyListYTranslation] =
		useState<number>(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies(error): We want to update the UI in case of an error state.
	useEffect(() => {
		if (!statusListRef.current) return;
		const statusList = statusListRef.current;

		const currentStatusItem = statusList.querySelector(
			`[data-status-key="${configKey}"]`,
		);
		if (!currentStatusItem) return;

		const currentStatusItemOffsetTop = (currentStatusItem as HTMLElement)
			.offsetTop;
		const currentStatusItemHeight = (currentStatusItem as HTMLElement)
			.offsetHeight;
		setConfigKeyListYTranslation(
			-currentStatusItemOffsetTop -
				currentStatusItemHeight / 2 +
				PROGESS_CONTAINER_HEIGHT / 2,
		);
	}, [configKey, error]);

	return (
		<div
			className="relative w-full overflow-hidden"
			style={{
				height: `${PROGESS_CONTAINER_HEIGHT}px`,
				maskImage:
					"linear-gradient(to bottom, rgb(0 0 0 / 0) 0%, rgb(0 0 0 / 1) 20% 80%, rgb(0 0 0 / 0) 100%)",
			}}
		>
			<div className="absolute top-0 bottom-0 left-[17px] w-[2px] bg-gradient-to-b from-black/10 via-black to-black/10 opacity-70 dark:from-white/10 dark:via-white dark:to-white/10" />

			<motion.div
				className="flex flex-col gap-8"
				animate={{ y: statusListYTranslation }}
				ref={statusListRef}
			>
				{attestationProgressConfigKeys.map((key, i) => {
					const attestationProgressConfig = attestationProgressConfigs[key];

					const currentConfigKeyIndex =
						attestationProgressConfigKeys.indexOf(configKey);
					const isOlderStep = i < currentConfigKeyIndex;
					const isUpcomingStep = i > currentConfigKeyIndex;

					const showErrorVariant =
						error &&
						key === configKey &&
						"errorState" in attestationProgressConfig;
					return (
						<div
							key={key}
							className="flex items-start gap-1"
							data-status-key={key}
						>
							<div className="relative flex aspect-square h-[36px] shrink-0 scale-100 items-center justify-center overflow-hidden rounded-full border border-border bg-white dark:bg-black">
								{showErrorVariant ? (
									<CircleAlert size={20} className="text-destructive" />
								) : key === configKey ? (
									attestationProgressConfig.isFinalState ? (
										<>
											<Check size={20} className="text-primary" />
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="h-3 w-3 animate-ping rounded-full bg-primary blur-sm" />
											</div>
										</>
									) : (
										<Loader2 size={20} className="animate-spin text-primary" />
									)
								) : isOlderStep ? (
									<Check size={20} className="text-primary" />
								) : isUpcomingStep ? (
									<Circle
										size={18}
										className="animate-pulse text-muted-foreground"
									/>
								) : null}
							</div>
							<div
								className="flex flex-col gap-2 px-2 transition-opacity"
								style={{
									opacity:
										i === currentConfigKeyIndex
											? 1
											: Math.abs(i - currentConfigKeyIndex) === 1
											  ? 0.8
											  : 0.5,
								}}
							>
								<span
									className={cn(
										"w-fit rounded-full border border-border px-2 font-bold font-sans text-foreground",
										showErrorVariant ? "text-destructive" : "",
									)}
								>
									{showErrorVariant
										? attestationProgressConfig.errorState?.title
										: attestationProgressConfig.title}
								</span>
								<span className="text-balance font-sans">
									{showErrorVariant
										? attestationProgressConfig.errorState?.description
										: attestationProgressConfig.description}
								</span>
								{showErrorVariant && (
									<div className="flex items-center gap-2">
										<Button
											size={"sm"}
											className="gap-2"
											variant={"outline"}
											onClick={() => setVisible(false)}
										>
											Back
										</Button>
										<Button
											size={"sm"}
											className="gap-2"
											onClick={startTransaction}
										>
											<RotateCw size={16} /> Retry
										</Button>
									</div>
								)}
								{attestationProgressConfig.isFinalState && (
									<div className="flex flex-col gap-2">
										{blockExplorerUrl && (
											<Link href={blockExplorerUrl} target="_blank">
												<Button size={"sm"} className="gap-2">
													View on EASScan <ArrowUpRight size={16} />
												</Button>
											</Link>
										)}
										<span className="flex items-center gap-1 text-muted-foreground text-xs">
											<Info size={16} />
											It might take a few minutes to reflect on the ecocert.
										</span>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</motion.div>
		</div>
	);
};

export default AttestationProgress;
