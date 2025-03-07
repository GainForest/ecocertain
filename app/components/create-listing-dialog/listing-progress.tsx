"use client";
import type { FullHypercert } from "@/app/graphql-queries/hypercerts";
import { Button } from "@/components/ui/button";
import { useHypercertClient } from "@/hooks/use-hypercerts-client";
import { cn } from "@/lib/utils";

import type {
	Currency,
	HypercertExchangeClient,
} from "@hypercerts-org/marketplace-sdk";
import { parseClaimOrFractionId } from "@hypercerts-org/sdk";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Check,
	Circle,
	CircleAlert,
	Info,
	Loader2,
	RotateCw,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
type ListingProgressConfig = {
	title: string;
	description: string;
	isFinalState?: true;
	errorState?: {
		title: string;
		description: string;
	};
};

const listingProgressConfigKeys = [
	"INITIALIZING",
	"CREATING_LISTING",
	"WAITING_FOR_TRANSFER_MANAGER_APPROVAL",
	"WAITING_FOR_TRANSFER_MANAGER_CONFIRMATION",
	"WAITING_FOR_COLLECTION_APPROVAL",
	"WAITING_FOR_COLLECTION_CONFIRMATION",
	"SIGNING_ORDER",
	"REGISTERING_ORDER",
	"COMPLETED",
] as const;
type ListingProgressConfigKey = (typeof listingProgressConfigKeys)[number];

const listingProgressConfigs: Record<
	ListingProgressConfigKey,
	ListingProgressConfig
> = {
	INITIALIZING: {
		title: "Initializing",
		description: "Accumulating your choices and requisites...",
		errorState: {
			title: "Unable to process your request",
			description: "Please make sure your wallet is connected, and try again.",
		},
	},
	CREATING_LISTING: {
		title: "Creating Listing",
		description: "Setting up your listing parameters...",
		errorState: {
			title: "Unable to create listing",
			description: "The listing could not be created. Please try again.",
		},
	},
	WAITING_FOR_TRANSFER_MANAGER_APPROVAL: {
		title: "Waiting for Marketplace Approval",
		description: "Please sign to approve marketplace interaction...",
		errorState: {
			title: "Marketplace approval rejected",
			description:
				"The approval to interact with the marketplace was rejected.",
		},
	},
	WAITING_FOR_TRANSFER_MANAGER_CONFIRMATION: {
		title: "Confirming Approval",
		description: "Waiting for marketplace approval transaction to confirm...",
		errorState: {
			title: "Approval not confirmed",
			description:
				"The approval transaction was not confirmed. Please try again.",
		},
	},
	WAITING_FOR_COLLECTION_APPROVAL: {
		title: "Waiting for Hypercert Approval",
		description: "Please sign to approve trading of your hypercert...",
		errorState: {
			title: "Trading approval rejected",
			description: "The trading approval was rejected.",
		},
	},
	WAITING_FOR_COLLECTION_CONFIRMATION: {
		title: "Confirming Trading Approval",
		description: "Waiting for hypercert approval transaction to confirm...",
		errorState: {
			title: "Trading approval not confirmed",
			description:
				"The hypercert approval transaction was not confirmed. Please try again.",
		},
	},
	SIGNING_ORDER: {
		title: "Sign Listing",
		description: "Please sign the transaction to create your listing...",
		errorState: {
			title: "Listing not signed",
			description:
				"Could not create the listing without your signature. Please try again.",
		},
	},
	REGISTERING_ORDER: {
		title: "Publishing Listing",
		description: "Registering your listing on the marketplace...",
		errorState: {
			title: "Publishing failed",
			description:
				"Could not register your listing on the marketplace. Please try again.",
		},
	},
	COMPLETED: {
		title: "Listing created!",
		description: "Your hypercert is now listed for sale.",
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

const ListingProgress = ({
	hypercert,
	values,
	visible = false,
	setVisible,
	hypercertExchangeClient,
}: {
	hypercert: FullHypercert;
	values: {
		price: number;
		currency: Currency;
	};
	visible?: boolean;
	setVisible: (visible: boolean) => void;
	hypercertExchangeClient: HypercertExchangeClient | null;
}) => {
	const [configKey, setConfigKey] =
		useState<ListingProgressConfigKey>("INITIALIZING");
	const [error, setError] = useState(false);

	const { isConnected, address, chainId } = useAccount();
	const { client } = useHypercertClient();
	const publicClient = usePublicClient();

	const startTransaction = async () => {
		setError(false);
		setConfigKey("INITIALIZING");
		if (!client || !publicClient || !hypercertExchangeClient || !isConnected) {
			setError(true);
			return;
		}

		setConfigKey("CREATING_LISTING");
		const [createMakerAskOutput, createMakerAskError] = await catchError(
			async () => {
				const { id: fractionId } = parseClaimOrFractionId(
					hypercert.hypercertId,
				);

				return await hypercertExchangeClient.createFractionalSaleMakerAsk({
					startTime: Math.floor(new Date().getTime() / 1000), // Order start time (in seconds)
					endTime: Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 365, // [1 Year] Order end time (in seconds)
					price:
						BigInt(values.price * 10 ** values.currency.decimals) /
						hypercert.totalUnits, // price multiplied by decimals
					itemIds: [fractionId + 1n], // fraction id being sold
					minUnitAmount: 1n, // minimum amount of units to sell per sale
					maxUnitAmount: 1_000_000n, // Maximum amount of units to sell per sale
					minUnitsToKeep: 0n, // Minimum amount of units to keep after the sale
					sellLeftoverFraction: true, // If you want to sell the leftover fraction
					currency: values.currency.address,
				});
			},
		);
		if (createMakerAskError || !createMakerAskOutput) {
			console.error(createMakerAskError);
			setError(true);
			return;
		}

		const { maker, isTransferManagerApproved, isCollectionApproved } =
			createMakerAskOutput;

		if (!isTransferManagerApproved) {
			setConfigKey("WAITING_FOR_TRANSFER_MANAGER_APPROVAL");
			const [approvalTransaction, approveTransferManagerError] =
				await catchError(
					async () =>
						await hypercertExchangeClient.grantTransferManagerApproval().call(),
				);
			if (approveTransferManagerError) {
				setError(true);
				return;
			}
			setConfigKey("WAITING_FOR_TRANSFER_MANAGER_CONFIRMATION");
			const [approvalReceipt, approvalReceiptError] = await catchError(
				async () => await approvalTransaction.wait(),
			);
			if (
				approvalReceiptError ||
				approvalReceipt === null ||
				approvalReceipt.status === null ||
				approvalReceipt.status === 0
			) {
				setError(true);
				return;
			}
		}

		if (!isCollectionApproved) {
			setConfigKey("WAITING_FOR_COLLECTION_APPROVAL");
			const [approveCollectionTx, approveCollectionError] = await catchError(
				async () =>
					await hypercertExchangeClient.approveAllCollectionItems(
						maker.collection,
					),
			);
			if (approveCollectionError) {
				setError(true);
				return;
			}

			setConfigKey("WAITING_FOR_COLLECTION_CONFIRMATION");
			const [collectionApprovalReceipt, collectionApprovalError] =
				await catchError(async () => await approveCollectionTx.wait());
			if (
				collectionApprovalError ||
				collectionApprovalReceipt === null ||
				collectionApprovalReceipt.status === null ||
				collectionApprovalReceipt.status === 0
			) {
				setError(true);
				return;
			}
		}

		// Sign the maker order
		setConfigKey("SIGNING_ORDER");
		const [signature, signatureError] = await catchError(
			async () => await hypercertExchangeClient.signMakerOrder(maker),
		);
		if (signatureError || !signature) {
			console.error(signatureError);
			setError(true);
			return;
		}

		// Register the order
		setConfigKey("REGISTERING_ORDER");
		const [registrationResult, registrationError] = await catchError(
			async () =>
				await hypercertExchangeClient.registerOrder({
					order: maker,
					signature,
				}),
		);
		if (registrationError || !registrationResult) {
			setError(true);
			return;
		}

		// Complete!
		setConfigKey("COMPLETED");
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
	}, [visible, client, publicClient, hypercertExchangeClient]);

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
				{listingProgressConfigKeys.map((key, i) => {
					const listingProgressConfig = listingProgressConfigs[key];

					const currentConfigKeyIndex =
						listingProgressConfigKeys.indexOf(configKey);
					const isOlderStep = i < currentConfigKeyIndex;
					const isUpcomingStep = i > currentConfigKeyIndex;

					const showErrorVariant =
						error && key === configKey && "errorState" in listingProgressConfig;
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
									listingProgressConfig.isFinalState ? (
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
										? listingProgressConfigs[key].errorState?.title
										: listingProgressConfig.title}
								</span>
								<span className="text-balance font-sans">
									{showErrorVariant
										? listingProgressConfigs[key].errorState?.description
										: listingProgressConfig.description}
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
								{listingProgressConfig.isFinalState && (
									<div className="flex flex-col gap-2">
										<Link href={`/hypercert/${hypercert.hypercertId}`}>
											<Button size={"sm"} className="gap-2">
												View hypercert <ArrowRight size={16} />
											</Button>
										</Link>
										<span className="flex items-center gap-1 text-muted-foreground text-xs">
											<Info size={16} />
											It might take a few seconds to show up.
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

export default ListingProgress;
