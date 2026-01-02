"use client";

import ErrorModalBody from "@/components/modals/error-body";
import { useHypercertExchangeClient } from "@/components/providers/HypercertExchangeClientProvider";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import {
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal/modal";
import { useTelemetry } from "@/contexts/telemetry";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { cn } from "@/lib/utils";
import type {
	Currency,
	HypercertExchangeClient,
} from "@hypercerts-org/marketplace-sdk";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { motion } from "framer-motion";
import { CircleAlert, RefreshCcw } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import FeedbackForm from "../feedback-form";
import usePurchaseFlowStore from "../store";
import usePaymentProgressStore, { PAYMENT_PROGRESS_STEPS } from "./store";

const PaymentProgressModalWrapper = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<ModalContent dismissible={false} className="font-sans">
			<ModalHeader>
				<ModalTitle>Purchase Ecocert</ModalTitle>
				<ModalDescription>Track the progress of your purchase</ModalDescription>
			</ModalHeader>
			{children}
		</ModalContent>
	);
};

const Paymentprogress = () => {
	const { popModal, hide } = useModal();

	const hypercert = usePurchaseFlowStore((state) => state.hypercert);
	const selectedOrder = usePurchaseFlowStore((state) => state.selectedOrder);
	const currency = usePurchaseFlowStore((state) => state.currency);
	const currentAmountSelectionTab = usePurchaseFlowStore(
		(state) => state.amountSelectionCurrentTab,
	);
	const amountSelectedInUnits = usePurchaseFlowStore(
		(state) => state.amountSelectedInUnits,
	);
	const hypercertExchangeClient = useHypercertExchangeClient();
	const { open } = useWeb3Modal();
	const { address } = useAccount();

	if (
		hypercert === null ||
		selectedOrder === null ||
		currency === null ||
		amountSelectedInUnits[currentAmountSelectionTab] === null
	) {
		return (
			<PaymentProgressModalWrapper>
				<ErrorModalBody ctaAction={() => popModal()} ctaText="Go back" />
				<ModalFooter>
					<Button variant={"secondary"} onClick={() => hide()}>
						Cancel
					</Button>
				</ModalFooter>
			</PaymentProgressModalWrapper>
		);
	}

	if (hypercertExchangeClient === undefined || address === undefined) {
		return (
			<PaymentProgressModalWrapper>
				<ErrorModalBody
					errorMessage="Wallet not connected"
					errorDescription="Please connect your wallet to continue"
					ctaAction={() => open()}
					ctaText="Connect Wallet"
				/>
			</PaymentProgressModalWrapper>
		);
	}

	return (
		<PaymentProgressModalWrapper>
			<PaymentProgressBody
				hypercert={hypercert}
				selectedOrder={selectedOrder}
				userAddress={address}
				unitsToPurchase={amountSelectedInUnits[currentAmountSelectionTab]}
				hypercertExchangeClient={hypercertExchangeClient}
			/>
		</PaymentProgressModalWrapper>
	);
};

const PaymentProgressBody = ({
	hypercert,
	selectedOrder,
	userAddress,
	unitsToPurchase,
	hypercertExchangeClient,
}: {
	hypercert: FullHypercert;
	selectedOrder: FullHypercert["orders"][number];
	userAddress: string;
	unitsToPurchase: bigint;
	hypercertExchangeClient: HypercertExchangeClient;
}) => {
	const {
		status,
		errorState,
		currentStepIndex,
		transactionHashes,
		start,
		reset,
	} = usePaymentProgressStore();

	const { hide, popModal, clear, pushModalByVariant } = useModal();
	const { logEvent } = useTelemetry();
	const flowIdRef = useRef<string>();
	const previousStepRef = useRef<number | null>(null);

	if (!flowIdRef.current) {
		flowIdRef.current =
			typeof crypto !== "undefined" && "randomUUID" in crypto
				? crypto.randomUUID()
				: `${Date.now()}-${Math.random()}`;
	}

	const emitPaymentEvent = useCallback(
		(
			statusOverride?: "in_progress" | "completed" | "error",
			txHash?: string,
		) => {
			const step = PAYMENT_PROGRESS_STEPS[currentStepIndex];
			void logEvent({
				type: "payment_flow",
				hypercertId: hypercert.hypercertId,
				orderId: selectedOrder.id,
				stepIndex: currentStepIndex,
				stepName: step?.title ?? `step-${currentStepIndex}`,
				status:
					statusOverride ??
					(status === "success"
						? "completed"
						: status === "error"
						  ? "error"
						  : "in_progress"),
				txHash,
				context: {
					flowId: flowIdRef.current,
					error: errorState,
					units: unitsToPurchase.toString(),
				},
			});
		},
		[
			currentStepIndex,
			errorState,
			hypercert.hypercertId,
			logEvent,
			selectedOrder.id,
			status,
			unitsToPurchase,
		],
	);

	useEffect(() => {
		if (previousStepRef.current === currentStepIndex) return;

		if (
			previousStepRef.current !== null &&
			previousStepRef.current < currentStepIndex
		) {
			const prevStep = PAYMENT_PROGRESS_STEPS[previousStepRef.current];
			let txHash: string | undefined;
			if (previousStepRef.current === 2 || previousStepRef.current === 3) {
				txHash = transactionHashes.approve;
			} else if (
				previousStepRef.current === 4 ||
				previousStepRef.current === 5
			) {
				txHash = transactionHashes.purchase;
			} else if (previousStepRef.current === 6) {
				txHash = transactionHashes.tip;
			}

			void logEvent({
				type: "payment_flow",
				hypercertId: hypercert.hypercertId,
				orderId: selectedOrder.id,
				stepIndex: previousStepRef.current,
				stepName: prevStep?.title ?? `step-${previousStepRef.current}`,
				status: "completed",
				txHash,
				context: {
					flowId: flowIdRef.current,
					error: null,
					units: unitsToPurchase.toString(),
				},
			});
		}

		previousStepRef.current = currentStepIndex;

		const isFinalStep = currentStepIndex === PAYMENT_PROGRESS_STEPS.length - 1;
		if (!isFinalStep) {
			void emitPaymentEvent("in_progress");
		}
	}, [
		currentStepIndex,
		emitPaymentEvent,
		hypercert.hypercertId,
		logEvent,
		selectedOrder.id,
		transactionHashes.approve,
		transactionHashes.purchase,
		transactionHashes.tip,
		unitsToPurchase,
	]);

	useEffect(() => {
		if (status === "success") {
			void emitPaymentEvent("completed");
		}
		if (status === "error") {
			void emitPaymentEvent("error");
		}
	}, [emitPaymentEvent, status]);

	const handleStart = useCallback(() => {
		start(
			hypercertExchangeClient,
			hypercert.hypercertId,
			selectedOrder.id,
			userAddress,
			unitsToPurchase,
		);
	}, [
		start,
		hypercertExchangeClient,
		hypercert.hypercertId,
		selectedOrder.id,
		userAddress,
		unitsToPurchase,
	]);

	const handleBack = useCallback(() => {
		if (status === "success") {
			reset();
		}
		popModal();
	}, [status, reset, popModal]);

	useEffect(() => {
		if (currentStepIndex !== 0 || status !== "pending") return;
		handleStart();
	}, [currentStepIndex, status, handleStart]);

	const getButtonLabel = () => {
		if (status === "success") {
			return "Next";
		}
		if (status === "pending") {
			return "Continue in background";
		}
		return "Close";
	};

	return (
		<>
			<div className="flex items-center">
				<motion.div
					className={cn("flex aspect-square items-center justify-center")}
					animate={{
						width: currentStepIndex === 0 ? "4rem" : "0rem",
						filter: "blur(4px) saturate(0)",
						opacity: 0.5,
						scale: 0.5,
					}}
					transition={{
						duration: 0.5,
						ease: "easeInOut",
					}}
				/>

				{PAYMENT_PROGRESS_STEPS.map((step, index) => {
					const stepDiff = Math.abs(index - currentStepIndex);

					return (
						<motion.div
							className={cn(
								"flex aspect-square items-center justify-center",
								stepDiff === 0 && "flex-1",
							)}
							animate={{
								width: stepDiff <= 1 ? "4rem" : "0rem",
								filter:
									stepDiff === 0
										? "blur(0px) saturate(1)"
										: "blur(4px) saturate(0)",
								opacity: stepDiff === 0 ? 1 : stepDiff === 1 ? 0.5 : 0,
								scale: stepDiff === 0 ? 1.2 : stepDiff === 1 ? 0.5 : 0,
							}}
							transition={{
								duration: 0.5,
								ease: "easeInOut",
							}}
							key={step.index}
						>
							{index === currentStepIndex && (
								<div
									className={cn(
										"absolute inset-10 rounded-full blur-xl",
										status === "error"
											? "bg-red-500/50"
											: "animate-pulse bg-green-500/50",
									)}
								/>
							)}
							{status === "error" ? (
								<CircleAlert className="z-10 size-16 text-red-500" />
							) : (
								<step.Icon className={cn("z-10 size-16 text-green-500")} />
							)}
						</motion.div>
					);
				})}
				<motion.div
					className={cn("flex aspect-square items-center justify-center")}
					animate={{
						width:
							currentStepIndex === PAYMENT_PROGRESS_STEPS.length - 1
								? "4rem"
								: "0rem",
						filter: "blur(4px) saturate(0)",
						opacity: 0.5,
						scale: 0.5,
					}}
					transition={{
						duration: 0.5,
						ease: "easeInOut",
					}}
				/>
			</div>
			{status === "error" ? (
				<div className="flex flex-col items-center">
					<span className="text-balance text-center font-bold text-destructive text-lg">
						{errorState?.title}
					</span>
					<span className="text-balance text-center text-muted-foreground">
						{errorState?.description}
					</span>
					<Button
						size={"sm"}
						variant={"outline"}
						className="mt-2 gap-2"
						onClick={handleStart}
					>
						<RefreshCcw className="size-4" /> Retry
					</Button>
				</div>
			) : (
				<div className="flex flex-col items-center">
					<span className="text-balance text-center font-bold text-lg text-primary">
						{PAYMENT_PROGRESS_STEPS[currentStepIndex].title}
					</span>
					<span className="text-balance text-center text-muted-foreground">
						{PAYMENT_PROGRESS_STEPS[currentStepIndex].description}
					</span>
				</div>
			)}
			<ModalFooter>
				{status !== "pending" && (
					<Button variant={"secondary"} onClick={() => handleBack()}>
						Go Back
					</Button>
				)}
				<Button
					variant={status === "success" ? "default" : "secondary"}
					onClick={() => {
						if (status === "pending") {
							hide();
							return;
						}
						if (status === "success") {
							pushModalByVariant({
								id: "feedback-form",
								content: <FeedbackForm subject={"donation"} />,
							});
							return;
						}
						hide();
						clear();
					}}
				>
					{getButtonLabel()}
				</Button>
			</ModalFooter>
		</>
	);
};

export default Paymentprogress;
