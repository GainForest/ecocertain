"use client";
import { Button } from "@/components/ui/button";
import { DIVVI_DATA_SUFFIX } from "@/config/divvi";
import { GAINFOREST_TIP_ADDRESS, GAINFOREST_TIP_AMOUNT } from "@/config/tip";
import { SUPPORTED_CHAINS } from "@/config/wagmi";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import useCopy from "@/hooks/use-copy";
import { useEthersProvider } from "@/hooks/use-ethers-provider";
import { useEthersSigner } from "@/hooks/use-ethers-signer";
import { cn } from "@/lib/utils";
import { submitReferral } from "@divvi/referral-sdk";
import {
	ChainId,
	HypercertExchangeClient,
} from "@hypercerts-org/marketplace-sdk";
import type {
	ContractTransactionReceipt,
	ContractTransactionResponse,
} from "ethers";
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
import React, {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	createWalletClient,
	custom,
	encodeAbiParameters,
	formatEther,
	parseAbiParameters,
} from "viem";
import { celo } from "viem/chains";
import { useAccount } from "wagmi";
import useOrdersInfo from "./hooks/useOrdersInfo";
import type { OrderPreferences } from "./hooks/usePaymentFlowDialog";
type TransactionProgressStatus = {
	title: string;
	description: string;
	isFinalState?: true;
	errorState?: {
		title: string;
		description: string;
	};
};

const transactionProgressStatusKeys = [
	"INITIALIZING",
	"PREPARING",
	"SPEND_APPROVING",
	"SPEND_APPROVAL_PENDING",
	"EXECUTING",
	"SIGNING",
	"TXN_PENDING",
	"TXN_CONFIRMED",
	"TIP_SIGNING",
	"COMPLETE",
] as const;
type TransactionProgressStatusKey =
	(typeof transactionProgressStatusKeys)[number];

const transactionProgressStatus: Record<
	TransactionProgressStatusKey,
	TransactionProgressStatus
> = {
	INITIALIZING: {
		title: "Initializing",
		description: "Accumulating your choices and requisites...",
	},
	PREPARING: {
		title: "Preparing",
		description: "Please wait while we prepare your transaction...",
		errorState: {
			title: "Invalid Order",
			description: "The order seems to be invalid. Please try again.",
		},
	},
	SPEND_APPROVING: {
		title: "Approve the spending cap limit",
		description: "Please approve the spending cap limit for the transaction.",
		errorState: {
			title: "Approval Rejected",
			description: "The spending cap approval was rejected.",
		},
	},
	SPEND_APPROVAL_PENDING: {
		title: "Waiting for approval confirmation",
		description:
			"Please wait while the spending cap limit approval is confirmed.",
		errorState: {
			title: "Approval Confirmation Error",
			description:
				"The spending cap limit could not be approved. Please try again.",
		},
	},
	EXECUTING: {
		title: "Executing Order",
		description: "Please wait while we execute your order...",
	},
	SIGNING: {
		title: "Sign the transaction",
		description: "Waiting for you to sign the transaction...",
		errorState: {
			title: "Transaction Rejected",
			description: "The transaction was rejected.",
		},
	},
	TXN_PENDING: {
		title: "Waiting for transaction to confirm",
		description: "Please wait while the transaction is confirmed.",
		errorState: {
			title: "Transaction not confirmed",
			description: "The transaction could not be confirmed.",
		},
	},
	TXN_CONFIRMED: {
		title: "Transaction Confirmed",
		description: "The transaction was confirmed successfully.",
	},
	TIP_SIGNING: {
		title: "Sign the transaction for the Platform Fee",
		description: `Please confirm the platform fee transaction of ${formatEther(
			GAINFOREST_TIP_AMOUNT,
		)} Celo.`,
	},
	COMPLETE: {
		title: "Transaction Completed",
		description: "placeholder", // This will be overridden in the JSX
		isFinalState: true,
	},
};

const PROGESS_CONTAINER_HEIGHT = 200;

const TransactionProgress = ({
	hypercert,
	orderPreferences,
	setVariant,
	transactionReceiptState,
}: {
	hypercert: FullHypercert;
	orderPreferences: OrderPreferences;
	setVariant: (variant: "amount-options" | "transaction-progress") => void;
	transactionReceiptState: [
		transactionReceipt: ContractTransactionReceipt | null,
		setTransactionReceipt: Dispatch<
			SetStateAction<ContractTransactionReceipt | null>
		>,
	];
}) => {
	const [status, setStatus] =
		useState<TransactionProgressStatusKey>("COMPLETE");
	const [error, setError] = useState(true);
	const [userDidTip, setUserDidTip] = useState(false);
	const [transactionReceipt, setTransactionReceipt] = transactionReceiptState;
	const { copy: copyTxnHash, isCopied: isTxnHashCopied } = useCopy();

	const ordersInfo = useOrdersInfo(hypercert);
	const { orderId, units: unitsToBuy } = orderPreferences;
	const { address, chainId } = useAccount();

	const provider = useEthersProvider({ chainId: Number(chainId) });
	const signer = useEthersSigner({ chainId: Number(chainId) });

	const startTransaction = async () => {
		setError(false);
		setUserDidTip(false);
		setStatus("PREPARING");
		const hcExchangeClient = new HypercertExchangeClient(
			Number(chainId) ?? SUPPORTED_CHAINS[0].id,
			// @ts-ignore
			provider,
			signer,
		);

		const ordersResponse = await hcExchangeClient.api.fetchOrdersByHypercertId({
			hypercertId: hypercert.hypercertId,
		});
		const orders = ordersResponse?.data ?? [];
		if (orders === null || orderId === undefined) {
			setError(true);
			return;
		}
		const order = orders.find((order) => order.id === orderId);
		if (!order || !unitsToBuy) {
			setError(true);
			return;
		}

		const takerOrder = hcExchangeClient.createFractionalSaleTakerBid(
			order, // The order you want to buy retreived from the graphQL API
			address, // Recipient address of the taker (if none, it will use the sender)
			unitsToBuy, // Number of units to buy.
			order.price, // Price per unit, in wei. In this example, we will end up with a total price of 1000 wei.
		);

		const totalPrice = unitsToBuy * BigInt(order.price);
		let approveTx: ContractTransactionResponse;
		try {
			setStatus("SPEND_APPROVING");

			approveTx = await hcExchangeClient.approveErc20(
				order.currency,
				totalPrice,
			);
		} catch (error) {
			setError(true);
			return;
		}

		try {
			setStatus("SPEND_APPROVAL_PENDING");
		} catch (error) {
			setError(true);
			return;
		}

		setStatus("EXECUTING");
		const overrides =
			order.currency === "0x0000000000000000000000000000000000000000"
				? {
						value: totalPrice,
				  }
				: undefined;

		let transaction: ContractTransactionResponse;

		try {
			setStatus("SIGNING");
			transaction = await hcExchangeClient
				.executeOrder(order, takerOrder, order.signature, undefined, overrides)
				.call();
		} catch (e) {
			setError(true);
			return;
		}
		try {
			setStatus("TXN_PENDING");
			const receipt = await transaction.wait();
			if (!receipt || receipt.status !== 1) {
				throw new Error();
			}
			setTransactionReceipt(receipt);
		} catch (error) {
			setError(true);
			return;
		}
		setStatus("TXN_CONFIRMED");

		// Start the tipping flow
		setStatus("TIP_SIGNING");
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
				setStatus("COMPLETE");
			}
		} catch (error) {
			// If platform fee transaction is rejected, continue to complete
			console.error(
				"Unable to process platform fee, and report to Divvi:",
				error,
			);
			setStatus("COMPLETE");
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(setStatus, startTransaction): We don't want to run the startTransaction all over again due to change in any function dependencies.
	useEffect(() => {
		if (!provider || !signer) {
			setStatus("INITIALIZING");
			return;
		}
		startTransaction();
	}, [provider, signer]);

	/* Use the following code for simulation of the progress, and comment the calling of startTransaction() */

	// useEffect(() => {
	//   const sim = setInterval(() => {
	//     setStatus((prev) => {
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
	const [statusListYTranslation, setStatusListYTranslation] =
		useState<number>(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies(error): We want to update the UI in case of an error state.
	useEffect(() => {
		if (!statusListRef.current) return;
		const statusList = statusListRef.current;

		const currentStatusItem = statusList.querySelector(
			`[data-status-key="${status}"]`,
		);
		if (!currentStatusItem) return;

		const currentStatusItemOffsetTop = (currentStatusItem as HTMLElement)
			.offsetTop;
		const currentStatusItemHeight = (currentStatusItem as HTMLElement)
			.offsetHeight;
		setStatusListYTranslation(
			-currentStatusItemOffsetTop -
				currentStatusItemHeight / 2 +
				PROGESS_CONTAINER_HEIGHT / 2,
		);
	}, [status, error]);

	return (
		<div
			className="relative w-full overflow-hidden"
			style={{
				height: `${PROGESS_CONTAINER_HEIGHT}px`,
				maskImage:
					"linear-gradient(to bottom, rgb(0 0 0 / 0) 0%, rgb(0 0 0 / 1) 20% 80%, rgb(0 0 0 / 0) 100%)",
			}}
		>
			<div className="absolute top-0 bottom-0 left-[11px] w-[2px] bg-gradient-to-b from-black/10 via-black to-black/10 opacity-70 dark:from-white/10 dark:via-white dark:to-white/10" />

			<motion.div
				className="flex flex-col gap-4"
				animate={{ y: statusListYTranslation }}
				ref={statusListRef}
			>
				{transactionProgressStatusKeys.map((key, i) => {
					const txnStatus = transactionProgressStatus[key];

					const currentStatusKeyIndex =
						transactionProgressStatusKeys.indexOf(status);
					const isOlderStep = i < currentStatusKeyIndex;
					const isUpcomingStep = i > currentStatusKeyIndex;

					const showErrorVariant =
						error && key === status && "errorState" in txnStatus;

					// Special handling for COMPLETE state description
					const description = txnStatus.isFinalState
						? userDidTip
							? "Thank you for your purchase and supporting GainForest!"
							: "The tip was rejected, but the purchase was successful!"
						: txnStatus.description;

					return (
						<div
							key={key}
							className="flex items-start gap-1"
							data-status-key={key}
						>
							<div className="relative flex aspect-square h-[24px] scale-100 items-center justify-center overflow-hidden rounded-full border border-border bg-white dark:bg-black">
								{showErrorVariant ? (
									<CircleAlert size={16} className="text-destructive" />
								) : key === status ? (
									txnStatus.isFinalState ? (
										<>
											<Check size={16} className="text-primary" />
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="h-3 w-3 animate-ping rounded-full bg-primary blur-sm" />
											</div>
										</>
									) : (
										<Loader2 size={16} className="animate-spin text-primary" />
									)
								) : isOlderStep ? (
									<Check size={16} className="text-primary" />
								) : isUpcomingStep ? (
									<Circle
										size={14}
										className="animate-pulse text-muted-foreground"
									/>
								) : null}
							</div>
							<div
								className="flex flex-col gap-1 px-2 transition-opacity"
								style={{
									opacity:
										i === currentStatusKeyIndex
											? 1
											: Math.abs(i - currentStatusKeyIndex) === 1
											  ? 0.8
											  : 0.5,
								}}
							>
								<span
									className={cn(
										"w-fit rounded-full border border-border bg-muted px-2 font-bold font-sans text-foreground text-sm",
										showErrorVariant ? "text-destructive" : "",
									)}
								>
									{showErrorVariant
										? transactionProgressStatus[key].errorState?.title
										: txnStatus.title}
								</span>
								<span className="font-sans text-sm">
									{showErrorVariant
										? transactionProgressStatus[key].errorState?.description
										: description}
								</span>
								{showErrorVariant && (
									<div className="flex items-center gap-2">
										<Button
											size={"sm"}
											variant={"outline"}
											className="h-6 gap-1 rounded-sm p-2"
											onClick={() => setVariant("amount-options")}
										>
											<ChevronLeft size={16} /> Go back
										</Button>
										<Button
											size={"sm"}
											className="h-6 gap-1 rounded-sm p-2"
											onClick={startTransaction}
										>
											<RotateCw size={16} /> Retry
										</Button>
									</div>
								)}
								{txnStatus.isFinalState &&
									transactionReceipt &&
									transactionReceipt.status === 1 && (
										<div className="flex flex-col gap-1">
											<span className="inline-block w-[150px] truncate rounded-full border border-border px-2 text-sm">
												{transactionReceipt.hash}
											</span>
											<Button
												size={"sm"}
												variant={"outline"}
												className="h-6 w-fit gap-1 rounded-sm p-2"
												onClick={() => copyTxnHash(transactionReceipt.hash)}
											>
												{isTxnHashCopied ? (
													<Check size={16} />
												) : (
													<Copy size={16} />
												)}
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

export default TransactionProgress;
