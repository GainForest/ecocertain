"use client";
import { Button } from "@/components/ui/button";
import { fetchHypercertById } from "@/graphql/hypercerts/queries/hypercerts";
import { cn } from "@/lib/utils";

import BatchTransferAbi from "@/abis/BatchTransfer.json";
import { fetchFractionsByHypercert } from "@/graphql/hypercerts/queries/fractions-by-hypercert";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { safeParse } from "@/lib/safe-parse";
import { tryCatch } from "@/lib/try-catch";
import {
	HypercertMinterAbi,
	parseClaimOrFractionId,
} from "@hypercerts-org/sdk";
import { AbiCoder, Contract, Interface } from "ethers";
import { BrowserProvider, type ContractTransactionResponse } from "ethers";
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
import {
	type TransactionReceipt,
	type WalletClient,
	decodeEventLog,
} from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { bigint } from "zod";
import { getSplitStatusAndDataByUnitsComparision } from "./utils";

type TransferProgressConfig = {
	title: string;
	description: string;
	isFinalState?: true;
	errorState?: {
		title: string;
		description: string;
	};
};

const transferProgressConfigKeys = [
	"INITIALIZING",
	"CHECKING_OWNERSHIP",
	"VERIFYING_HYPERCERT",
	"SPLIT_HYPERCERT_SIGNING",
	"SPLIT_HYPERCERT_CONFIRMATION",
	"APPROVAL_SIGNING",
	"APPROVAL_CONFIRMATION",
	"TRANSFER_SIGNING",
	"TRANSFER_CONFIRMATION",
	"COMPLETED",
] as const;
type TransferProgressConfigKey = (typeof transferProgressConfigKeys)[number];

const transferProgressConfigs: Record<
	TransferProgressConfigKey,
	TransferProgressConfig
> = {
	INITIALIZING: {
		title: "Initializing",
		description: "Accumulating your choices and requisites...",
		errorState: {
			title: "Unable to process your request",
			description:
				"Please make sure your wallet is connected to a supported chain, and try again.",
		},
	},
	CHECKING_OWNERSHIP: {
		title: "Checking Ownership",
		description: "Checking if you are the owner of the hypercert...",
		errorState: {
			title: "You are not authorized",
			description: "We were unable to verify you as owner of the hypercert.",
		},
	},
	VERIFYING_HYPERCERT: {
		title: "Verifying hypercert",
		description:
			"Checking if the hypercert has enough units to be transferred...",
		errorState: {
			title: "Insufficient units",
			description:
				"The hypercert does not have enough units to be transferred.",
		},
	},
	SPLIT_HYPERCERT_SIGNING: {
		title: "Waiting for your signature (1/3)",
		description: "Please sign the transaction to split the hypercert...",
		errorState: {
			title: "Unable to split hypercert",
			description: "The transaction was rejected.",
		},
	},
	SPLIT_HYPERCERT_CONFIRMATION: {
		title: "Waiting for confirmation",
		description: "Waiting for the transaction to be confirmed...",
		errorState: {
			title: "Transaction not confirmed",
			description: "The transaction was not confirmed. Please try again.",
		},
	},
	APPROVAL_SIGNING: {
		title: "Waiting for your signature (2/3)",
		description: "Please sign the transaction to approve the split...",
		errorState: {
			title: "Transaction not approved",
			description: "The transaction was rejected.",
		},
	},
	APPROVAL_CONFIRMATION: {
		title: "Waiting for confirmation",
		description: "Waiting for the transaction to be confirmed...",
		errorState: {
			title: "Transaction not confirmed",
			description: "The transaction was not confirmed. Please try again.",
		},
	},
	TRANSFER_SIGNING: {
		title: "Waiting for your signature (3/3)",
		description:
			"Please sign the transaction to transfer the hypercert split...",
		errorState: {
			title: "Unable to transfer hypercert",
			description: "The transaction was rejected.",
		},
	},
	TRANSFER_CONFIRMATION: {
		title: "Waiting for confirmation",
		description: "Waiting for the transaction to be confirmed...",
		errorState: {
			title: "Transaction not confirmed",
			description: "The transaction was not confirmed. Please try again.",
		},
	},
	COMPLETED: {
		title: "Transfer complete!",
		description: "Your hypercert has been transferred to your gitcoin donors.",
		isFinalState: true,
	},
};

const PROGESS_CONTAINER_HEIGHT = 300;

const Progress = ({
	gitcoinApplicationId,
	ecocertId,
	values,
	walletClient,
	onCancel,
}: {
	gitcoinApplicationId: string;
	ecocertId: string;
	values: {
		amountInUsd: number;
		donorAddress: string;
	}[];
	walletClient?: WalletClient;
	onCancel: () => void;
}) => {
	const [configKey, setConfigKey] =
		useState<TransferProgressConfigKey>("INITIALIZING");
	const [error, setError] = useState(false);

	const { isConnected, chainId } = useAccount();
	const address = "0x855CCEDBd397F030f33Fa1b8F671F112616262e6";

	const startTransaction = async () => {
		setError(false);
		setConfigKey("INITIALIZING");
		if (!walletClient || !isConnected || chainId !== 42220) {
			console.error("Wallet not connected or wrong chain");
			setError(true);
			return;
		}
		const provider = new BrowserProvider(walletClient.transport);
		const signer = await provider.getSigner();

		// Show the completion state if the transaction has already been completed in the past.
		const isCompleted = window.localStorage.getItem(
			`gitcoin-round-35-application-${gitcoinApplicationId}-completed`,
		);
		if (isCompleted === "true") {
			setConfigKey("COMPLETED");
			return;
		}

		// Check if the user is the owner of the hypercert
		setConfigKey("CHECKING_OWNERSHIP");
		const [hypercert, hypercertFetchError] = await tryCatch(
			async () => await fetchHypercertById(ecocertId),
		);
		if (hypercertFetchError) {
			console.error("Failed to fetch hypercert:", hypercertFetchError);
			setError(true);
			return;
		}
		const hypercertOwner = hypercert.creatorAddress;
		if (hypercertOwner.toLowerCase() !== address?.toLowerCase()) {
			console.error(
				"User is not the owner of the hypercert.",
				"Expected:",
				hypercertOwner,
				"Got:",
				address,
			);
			setError(true);
			return;
		}

		// Verify if the hypercert has enough units to be transferred
		setConfigKey("VERIFYING_HYPERCERT");
		const [fractions, fractionsFetchError] = await tryCatch(
			async () => await fetchFractionsByHypercert(ecocertId),
		);
		if (fractionsFetchError || fractions === null) {
			console.error("Failed to fetch fractions:", fractionsFetchError);
			setError(true);
			return;
		}
		const ownerFractions = fractions.filter(
			(fraction) =>
				fraction.ownerAddress.toLowerCase() === address.toLowerCase(),
		);
		if (ownerFractions.length === 0) {
			console.error("No fractions found for owner");
			setError(true);
			return;
		}
		const ownerFractionWithHighestUnits = ownerFractions.reduce(
			(max, fraction) => {
				return fraction.units > max.units ? fraction : max;
			},
			ownerFractions[0],
		);

		// Calculate no. of units in 1 USD.
		const hcPricePerPercentInUSD = hypercert.pricePerPercentInUSD;
		if (hcPricePerPercentInUSD === undefined) {
			setError(true);
			return;
		}
		const hcTotalPriceInUSD = 100 * hcPricePerPercentInUSD;
		console.log({
			hypercert,
			hcTotalPriceInUSD,
			num: Math.floor(hcTotalPriceInUSD * 1000),
		});
		const unitsPerUSD =
			(hypercert.totalUnits * 1000n) /
			BigInt(Math.floor(hcTotalPriceInUSD * 1000));

		// Calculate the amount of units to transfer / split to each donor.
		const unitsToTransfer = values.map((value) => {
			return (
				(BigInt(Math.floor(value.amountInUsd * 1000)) * unitsPerUSD) / 1000n
			);
		});

		// Check if the fractions are already split.
		type DonorFractionsToTransfer = {
			tokenId: string;
			units: string;
			address: string;
		}[];

		let donorFractionsToTransfer: DonorFractionsToTransfer | null = null;
		const donorFractionsToTransferStr = window.localStorage.getItem(
			`gitcoin-round-35-application-${gitcoinApplicationId}-donor-fractions-to-transfer`,
		);
		if (donorFractionsToTransferStr !== null) {
			const parsedDonorFractionsToTransfer = safeParse(
				donorFractionsToTransferStr,
			);
			if (
				Array.isArray(parsedDonorFractionsToTransfer) &&
				parsedDonorFractionsToTransfer.length > 0 &&
				parsedDonorFractionsToTransfer.every(
					(f) =>
						typeof f.tokenId === "string" &&
						typeof f.units === "string" &&
						typeof f.address === "string",
				)
			) {
				donorFractionsToTransfer = parsedDonorFractionsToTransfer;
			}
		}
		if (!donorFractionsToTransfer) {
			const {
				donorFractionsToTransfer: computedDonorFractionsToTransfer,
				isAlreadySplit,
			} = getSplitStatusAndDataByUnitsComparision(
				ownerFractions.map((f) => ({
					tokenId: f.fractionId.split("-")[2],
					units: f.units,
				})),
				unitsToTransfer.map((u, i) => ({
					address: values[i].donorAddress,
					units: u.toString(),
				})),
			);
			console.log(computedDonorFractionsToTransfer, isAlreadySplit);
			window.localStorage.setItem(
				`gitcoin-round-35-application-${gitcoinApplicationId}-donor-fractions-to-transfer`,
				JSON.stringify(computedDonorFractionsToTransfer),
			);
			donorFractionsToTransfer = computedDonorFractionsToTransfer;
			if (!isAlreadySplit) {
				donorFractionsToTransfer = null;
			}
		}

		// Check if the total units to transfer is greater than the owner's fraction.
		const totalUnitsToTransfer = unitsToTransfer.reduce(
			(acc, curr) => acc + curr,
			BigInt(0),
		);
		if (totalUnitsToTransfer > BigInt(ownerFractionWithHighestUnits.units)) {
			console.error(
				"Total units to transfer exceeds owner's fraction.",
				"Total units to transfer:",
				totalUnitsToTransfer,
				"Owner's highest fraction:",
				ownerFractionWithHighestUnits,
			);
			setError(true);
			return;
		}

		const hypercertMinterContract = new Contract(
			"0x16ba53b74c234c870c61efc04cd418b8f2865959",
			HypercertMinterAbi,
			signer,
		);
		if (donorFractionsToTransfer === null) {
			// Split the hypercert
			setConfigKey("SPLIT_HYPERCERT_SIGNING");
			const [splitTx, splitTxError] =
				await tryCatch<ContractTransactionResponse>(
					async () =>
						await hypercertMinterContract.splitFraction(
							signer.address, // Hypercert owner address ==> should be same as signer
							ownerFractionWithHighestUnits.fractionId.split("-")[2], // Token ID of the fraction to split
							[
								...unitsToTransfer,
								BigInt(ownerFractionWithHighestUnits.units) -
									totalUnitsToTransfer,
							], // Amounts in units to split summing up to the owner's fraction
						),
				);
			if (splitTxError) {
				console.error("Split transaction failed:", splitTxError);
				setError(true);
				console.log(unitsToTransfer, ownerFractionWithHighestUnits);
				return;
			}

			// Wait for the transaction to be confirmed.
			setConfigKey("SPLIT_HYPERCERT_CONFIRMATION");
			const [splitTxReceipt, splitTxReceiptError] = await tryCatch(
				async () => await splitTx.wait(),
			);
			if (splitTxReceiptError || !splitTxReceipt) {
				console.error(
					"Split transaction confirmation failed:",
					splitTxReceiptError,
				);
				setError(true);
				return;
			}

			// Get the successfully split fractions data.
			const logs = (splitTxReceipt as unknown as TransactionReceipt).logs;
			const events = logs.map((log) =>
				decodeEventLog({
					abi: HypercertMinterAbi,
					data: log.data,
					topics: log.topics,
				}),
			);
			const batchValueTransferEvent = events.find(
				(event) => event.eventName === "BatchValueTransfer",
			);
			if (!batchValueTransferEvent) {
				console.error(
					"Failed to process split data: No batch value transfer event found",
				);
				setError(true);
				return;
			}

			type BatchValueTransferArgsType = {
				toTokenIds: bigint[];
				values: bigint[];
			};
			const args =
				batchValueTransferEvent.args as unknown as BatchValueTransferArgsType;
			const splitTokenIds = args.toTokenIds.map((id) => id.toString());
			const splitTokenAmounts = args.values.map((amt) => amt.toString());

			// Also add the origin token id data to make the sum total.
			splitTokenIds.push(
				ownerFractionWithHighestUnits.fractionId.split("-")[2],
			);
			const initialFractionUnits = BigInt(ownerFractionWithHighestUnits.units);
			const splitFractionUnits = splitTokenAmounts.reduce(
				(acc, curr) => acc + BigInt(curr),
				BigInt(0),
			);
			splitTokenAmounts.push(
				(initialFractionUnits - splitFractionUnits).toString(),
			);

			// Compute the fraction each donor should receive based on the amount they donated.
			const { donorFractionsToTransfer: computedDonorFractionsToTransfer } =
				getSplitStatusAndDataByUnitsComparision(
					splitTokenIds.map((t) => ({
						tokenId: t,
						units: splitTokenAmounts[splitTokenIds.indexOf(t)],
					})),
					unitsToTransfer.map((u, i) => ({
						address: values[i].donorAddress,
						units: u.toString(),
					})),
				);
			if (!computedDonorFractionsToTransfer) {
				console.error("Failed to compute donor fractions to transfer");
				setError(true);
				return;
			}
			donorFractionsToTransfer = computedDonorFractionsToTransfer;
			window.localStorage.setItem(
				`gitcoin-round-35-application-${gitcoinApplicationId}-donor-fractions-to-transfer`,
				JSON.stringify(computedDonorFractionsToTransfer),
			);
		}

		// Approve
		setConfigKey("APPROVAL_SIGNING");
		const [approveTx, approveTxError] = await tryCatch(
			async () =>
				await hypercertMinterContract.setApprovalForAll(
					"0x16ba53b74c234c870c61efc04cd418b8f2865959",
					true,
				),
		);
		if (approveTxError) {
			console.error("Approval transaction failed:", approveTxError);
			setError(true);
			return;
		}

		// Wait for the transaction to be confirmed.
		setConfigKey("APPROVAL_CONFIRMATION");
		const [approveTxReceipt, approveTxReceiptError] = await tryCatch(
			async () => await approveTx.wait(),
		);

		if (approveTxReceiptError || !approveTxReceipt) {
			console.error("Approval confirmation failed:", approveTxReceiptError);
			setError(true);
			return;
		}

		// Transfer the fractions to the donors.
		setConfigKey("TRANSFER_SIGNING");
		const batchTransferContract = new Contract(
			"0xB64B7e4793D72958e028B1D5D556888b115c4c3E",
			BatchTransferAbi,
			signer,
		);

		const recipients = donorFractionsToTransfer.map((f) => f.address);
		const fractionIds = donorFractionsToTransfer.map((f) => f.tokenId);
		const encodedData = AbiCoder.defaultAbiCoder().encode(
			["tuple(address[], uint256[])"],
			[[recipients, fractionIds]],
		);

		const [transferTx, transferTxError] = await tryCatch(
			async () => await batchTransferContract.batchTransfer(encodedData),
		);
		if (transferTxError) {
			console.error("Transfer transaction failed:", transferTxError);
			setError(true);
			return;
		}

		// Wait for the transaction to be confirmed.
		setConfigKey("TRANSFER_CONFIRMATION");
		const [transferTxReceipt, transferTxReceiptError] = await tryCatch(
			async () => await transferTx.wait(),
		);

		if (transferTxReceiptError || !transferTxReceipt) {
			console.error("Transfer confirmation failed:", transferTxReceiptError);
			setError(true);
			return;
		}

		// Complete!
		setConfigKey("COMPLETED");
		window.localStorage.setItem(
			`gitcoin-round-35-application-${gitcoinApplicationId}-completed`,
			"true",
		);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(startTransaction): startTransaction is not something we want to listen for changes here
	useEffect(() => {
		if (!walletClient) {
			setConfigKey("INITIALIZING");
			const showInitializationError = setTimeout(() => {
				console.error("Wallet client not available after timeout");
				setError(true);
			}, 5000);
			return () => {
				clearTimeout(showInitializationError);
			};
		}
		startTransaction();
	}, [walletClient]);

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
				{transferProgressConfigKeys.map((key, i) => {
					const listingProgressConfig = transferProgressConfigs[key];

					const currentConfigKeyIndex =
						transferProgressConfigKeys.indexOf(configKey);
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
										? transferProgressConfigs[key].errorState?.title
										: listingProgressConfig.title}
								</span>
								<span className="text-balance font-sans">
									{showErrorVariant
										? transferProgressConfigs[key].errorState?.description
										: listingProgressConfig.description}
								</span>
								{showErrorVariant && (
									<div className="flex items-center gap-2">
										<Button
											size={"sm"}
											className="gap-2"
											variant={"outline"}
											onClick={onCancel}
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
							</div>
						</div>
					);
				})}
			</motion.div>
		</div>
	);
};

export default Progress;
