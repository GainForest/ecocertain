"use client";
import { Button } from "@/components/ui/button";
import { DIVVI_DATA_SUFFIX } from "@/config/divvi";
import { GAINFOREST_TIP_ADDRESS, GAINFOREST_TIP_AMOUNT } from "@/config/tip";
import { useHypercertClient } from "@/hooks/use-hypercerts-client";
import { sendEmailAndUpdateGoogle } from "@/lib/sendEmailAndUpdateGoogle";
import { cn } from "@/lib/utils";
import { constructHypercertIdFromReceipt } from "@/utils/constructHypercertIdFromReceipt";
import { submitReferral } from "@divvi/referral-sdk";
import {
	type HypercertMetadata,
	TransferRestrictions,
	formatHypercertData,
} from "@hypercerts-org/sdk";
import { motion } from "framer-motion";
import {
	Check,
	ChevronLeft,
	Circle,
	CircleAlert,
	Copy,
	Dot,
	Loader2,
	RotateCw,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { createWalletClient, custom, formatEther } from "viem";
import { celo } from "viem/chains";
import { useAccount, usePublicClient } from "wagmi";
import type { MintingFormValues } from "../hypercert-form";

type MintingProgressConfig = {
	title: string;
	description: string;
	isFinalState?: true;
	errorState?: {
		title: string;
		description: string;
	};
};

const mintingProgressConfigKeys = [
	"INITIALIZING",
	"GENERATING_IMG",
	"PARSING_GEOJSON",
	"UPLOADING_GEOJSON",
	"GENERATING_METADATA",
	"MINTING",
	"WAITING_TO_MINT",
	"TIP_SIGNING",
	"COMPLETED",
] as const;
type MintingProgressConfigKey = (typeof mintingProgressConfigKeys)[number];

const mintingProgressConfigs: Record<
	MintingProgressConfigKey,
	MintingProgressConfig
> = {
	INITIALIZING: {
		title: "Initializing",
		description: "Accumulating your choices and requisites.",
		errorState: {
			title: "Unable to process your request",
			description: "Please make sure your wallet is connected, and try again.",
		},
	},
	GENERATING_IMG: {
		title: "Generating Image",
		description: "Please wait while we generate image for the hypercert.",
		errorState: {
			title: "Unable to generate image",
			description:
				"The hypercert image could not be generated. Please try again.",
		},
	},
	PARSING_GEOJSON: {
		title: "Parsing GeoJSON",
		description: "Please wait while we parse the GeoJSON file.",
		errorState: {
			title: "Unable to parse GeoJSON",
			description: "The GeoJSON file could not be parsed. Please try again.",
		},
	},
	UPLOADING_GEOJSON: {
		title: "Uploading GeoJSON",
		description: "Please wait while the GeoJSON is being uploaded to IPFS.",
		errorState: {
			title: "Unable to upload GeoJSON",
			description:
				"The GeoJSON could not be uploaded to IPFS. Please try again.",
		},
	},
	GENERATING_METADATA: {
		title: "Generating metadata",
		description: "Please wait while we prepare metadata for the mint.",
		errorState: {
			title: "Something went wrong",
			description:
				"We couldn't prepare metadata for the mint. Please try again later.",
		},
	},
	MINTING: {
		title: "Minting Hypercert",
		description: "Please sign the mint transaction when asked for approval",
		errorState: {
			title: "Transaction Rejected",
			description: "The transaction was rejected.",
		},
	},
	WAITING_TO_MINT: {
		title: "Waiting for the transaction to complete",
		description: "Please wait while the transaction is completed.",
		errorState: {
			title: "Transaction not completed",
			description: "The transaction could not be completed. Please try again.",
		},
	},
	TIP_SIGNING: {
		title: "Sign the transaction for the Platform Fee",
		description: `Please confirm the platform fee transaction of ${formatEther(
			GAINFOREST_TIP_AMOUNT,
		)} Celo.`,
	},
	COMPLETED: {
		title: "Hypercert Minted",
		description: "placeholder", // Will be overridden in JSX
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

const MintingProgress = ({
	mintingFormValues,
	generateImage,
	geoJSONFile,
	badges,
	visible = false,
	setVisible,
}: {
	mintingFormValues: MintingFormValues;
	generateImage: () => Promise<string | undefined>;
	geoJSONFile: File | null;
	badges: string[];
	visible?: boolean;
	setVisible: (visible: boolean) => void;
}) => {
	const [configKey, setConfigKey] =
		useState<MintingProgressConfigKey>("INITIALIZING");
	const [error, setError] = useState(false);
	const [userDidTip, setUserDidTip] = useState(false);
	const [mintedHypercertId, setMintedHypercertId] = useState<string>();

	const { isConnected, address } = useAccount();
	const { client } = useHypercertClient();
	const publicClient = usePublicClient();

	const startTransaction = async () => {
		setError(false);
		setUserDidTip(false);
		setConfigKey("INITIALIZING");
		const values = mintingFormValues;
		if (!client || !publicClient || !isConnected) {
			setError(true);
			return;
		}

		setConfigKey("GENERATING_IMG");
		const [image, imageGenerationError] = await catchError(generateImage);
		if (imageGenerationError || image === undefined) {
			setError(true);
			return;
		}

		setConfigKey("PARSING_GEOJSON");
		const [geoJSONData, geoJSONParsingError] = await catchError(async () => {
			if (values.geojson) {
				try {
					const response = await fetch(values.geojson);
					return await response.json();
				} catch (error) {
					console.error("Error fetching GeoJSON:", error);
				}
			} else if (geoJSONFile) {
				try {
					const text = await geoJSONFile.text();
					return JSON.parse(text);
				} catch (error) {
					console.error("Error parsing GeoJSON file:", error);
				}
			}
		});
		if (geoJSONParsingError || geoJSONData === undefined) {
			setError(true);
			return;
		}

		const [geoJSONipfsLink, geoJSONUploadError] = await catchError(async () => {
			const ipfsUploadResponse = await fetch("/api/ipfs-upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(geoJSONData),
			});
			const data = await ipfsUploadResponse.json();
			return data.link;
		});
		if (geoJSONUploadError || geoJSONipfsLink === undefined) {
			setError(true);
			return;
		}

		setConfigKey("GENERATING_METADATA");

		const metadata: HypercertMetadata = {
			name: values.title,
			description: values.description,
			image: image,
			external_url: values.link,
		};

		const formattedMetadata = formatHypercertData({
			...metadata,
			version: "2.0",
			properties: [
				{
					trait_type: "geoJSON", //human readable
					type: "application/geo+json", //MIME type
					src: geoJSONipfsLink, //IPFS link
					name: `${
						values.title
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, "-") // Replace any non-alphanumeric chars with single dash
							.replace(/^-+|-+$/g, "") // Remove leading/trailing dashes
					}.geojson`,
				},
			],
			impactScope: ["all"],
			excludedImpactScope: [],
			workScope: badges,
			excludedWorkScope: [],
			rights: ["Public Display"],
			excludedRights: [],
			workTimeframeStart:
				(values.projectDates[0] ?? new Date()).getTime() / 1000,
			workTimeframeEnd: (values.projectDates[1] ?? new Date()).getTime() / 1000,
			impactTimeframeStart:
				(values.projectDates[0] ?? new Date()).getTime() / 1000,
			impactTimeframeEnd:
				(values.projectDates[1] ?? new Date()).getTime() / 1000,
			contributors: values.contributors.split(", ").filter(Boolean),
		});
		if (!formattedMetadata.valid || !formattedMetadata.data) {
			setError(true);
			return;
		}

		setConfigKey("MINTING");
		const metadataPayload = formattedMetadata.data;
		const [mintHash, mintingError] = await catchError(() =>
			client.mintClaim(
				metadataPayload,
				100_000_000n,
				TransferRestrictions.AllowAll,
			),
		);
		if (mintingError) {
			console.error("Minting Error\nHere are the clients for debugging:", {
				hypercertClient: client,
				publicClient,
			});
			setError(true);
			return;
		}

		setConfigKey("WAITING_TO_MINT");
		const [mintReceipt, mintReceiptError] = await catchError(async () => {
			const receipt = await publicClient.waitForTransactionReceipt({
				hash: mintHash,
			});
			return receipt;
		});
		if (mintReceiptError || mintReceipt.status === "reverted") {
			setError(true);
			return;
		}
		const hypercertId = constructHypercertIdFromReceipt(
			mintReceipt,
			publicClient.chain.id,
		);
		if (!hypercertId) {
			setError(true);
			return;
		}

		setConfigKey("TIP_SIGNING");
		try {
			const walletClient = createWalletClient({
				chain: celo,
				transport: custom(
					// biome-ignore lint/suspicious/noExplicitAny: window.ethereum has to be any
					"ethereum" in window ? (window.ethereum as any) : null,
				),
			});
			const [account] = await walletClient.getAddresses();
			const txhash = await walletClient.sendTransaction({
				account,
				to: GAINFOREST_TIP_ADDRESS,
				value: GAINFOREST_TIP_AMOUNT,
				data: `0x${DIVVI_DATA_SUFFIX}`,
			});

			if (txhash) {
				setUserDidTip(true);
				// We don't wait for confirmation as per requirements
				submitReferral({
					txHash: txhash as `0x${string}`,
					chainId: celo.id,
				});
				setConfigKey("COMPLETED");
			}
		} catch (error) {
			// If platform fee transaction is rejected, continue to complete
			console.error(
				"Unable to process platform fee, and report to Divvi:",
				error,
			);
			setConfigKey("COMPLETED");
		}

		setMintedHypercertId(hypercertId);
		if (mintingFormValues.contact) {
			try {
				sendEmailAndUpdateGoogle({
					hypercertId,
					contactInfo: mintingFormValues.contact,
				});
			} catch {}
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(startTransaction): startTransaction is not something we want to listen for changes here
	useEffect(() => {
		if (!visible || !client || !publicClient) {
			setConfigKey("INITIALIZING");
			const showInitializationError = setTimeout(() => {
				setError(true);
			}, 5000);
			return () => {
				clearTimeout(showInitializationError);
			};
		}
		startTransaction();
	}, [visible, client, publicClient]);

	/* Use the following code for simulation of the progress, and comment the calling of startTransaction() */

	// useEffect(() => {
	//   const sim = setInterval(() => {
	//     setConfigKey((prev) => {
	//       const i = transactionProgressStatusKeys.indexOf(prev);
	//       const next =
	//         transactionProgressStatusKeys[
	//           (i + 1) % transactionProgressStatusKeys.length
	//         ];
	//       return next;
	//     });
	//   }, 2000);
	//   return () => {
	//     clearInterval(sim);
	//   };
	// }, []);

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
				{mintingProgressConfigKeys.map((key, i) => {
					const mintingProgressConfig = mintingProgressConfigs[key];

					const currentConfigKeyIndex =
						mintingProgressConfigKeys.indexOf(configKey);
					const isOlderStep = i < currentConfigKeyIndex;
					const isUpcomingStep = i > currentConfigKeyIndex;

					const showErrorVariant =
						error && key === configKey && "errorState" in mintingProgressConfig;
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
									mintingProgressConfig.isFinalState ? (
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
										? mintingProgressConfigs[key].errorState?.title
										: mintingProgressConfig.title}
								</span>
								<span className="text-balance font-sans">
									{showErrorVariant
										? mintingProgressConfigs[key].errorState?.description
										: mintingProgressConfig.isFinalState
										  ? mintingProgressConfigKeys[currentConfigKeyIndex] ===
											  "COMPLETED"
												? userDidTip
													? "Your hypercert was minted successfully. Thank you for supporting GainForest!"
													: "The tip was rejected, but your hypercert was minted successfully!"
												: "The hypercert was minted successfully!"
										  : mintingProgressConfig.description}
								</span>
								{showErrorVariant && (
									<div className="flex items-center gap-2">
										<Button
											size={"sm"}
											className="gap-2"
											variant={"outline"}
											onClick={() => setVisible(false)}
										>
											Cancel
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
								{mintingProgressConfig.isFinalState && (
									<div className="flex flex-col gap-1">
										{address && (
											<Link href={`/profile/${address}?view=created`}>
												<Button size={"sm"}>View my hypercerts</Button>
											</Link>
										)}
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

export default MintingProgress;
