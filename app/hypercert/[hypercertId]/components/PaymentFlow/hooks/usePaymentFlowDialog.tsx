"use client";

import { Button } from "@/components/ui/button";
import { SUPPORTED_CHAINS } from "@/config/wagmi";
import type {
	FullHypercert,
	FullHypercertWithOrder,
} from "@/graphql/hypercerts/queries/hypercerts";
import type { ContractTransactionReceipt } from "ethers";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useAccount } from "wagmi";
import AmountOptions from "../AmountOptions";
import Prerequisites from "../Prerequisites";
import TransactionProgress from "../TransactionProgress";
import useOrdersInfo from "./useOrdersInfo";
import useUserFunds from "./useUserFunds";

const supportedChainIds: number[] = SUPPORTED_CHAINS.map((chain) => chain.id);

type PaymentFlowUIConfig = {
	title: string;
	description: string;
	content: React.ReactNode;
	nextButton?: React.ReactNode;
	setVariant?: Dispatch<
		SetStateAction<"amount-options" | "transaction-progress">
	>;
	transactionReceipt?: ContractTransactionReceipt;
};

export type OrderPreferences = {
	orderId: string;
	units: bigint;
};

const InvalidPaymentFlowUIConfig: PaymentFlowUIConfig = {
	title: "Unable to fund",
	description: "Something went wrong. Please try again.",
	content: (
		<span>
			An error occured, while funding this hypercert. Please try again.
		</span>
	),
};

const usePaymentFlowDialog = (
	hypercert: FullHypercert,
): PaymentFlowUIConfig => {
	const { address, isConnected, chainId: currentChainId } = useAccount();
	const ordersInfo = useOrdersInfo(hypercert);
	const orderChainIds = ordersInfo.map((order) => order.data.chainId);

	const orderChainIdsSupportedByApp = SUPPORTED_CHAINS.filter((chain) =>
		orderChainIds.includes(chain.id.toString()),
	);
	const isCurrentChainSupportedByApp =
		currentChainId !== undefined && supportedChainIds.includes(currentChainId);
	const isCurrentChainSupportedByOrders =
		currentChainId !== undefined &&
		orderChainIds.includes(currentChainId.toString());

	const [variant, setVariant] = useState<
		"amount-options" | "transaction-progress"
	>("amount-options");

	const [orderPreferences, setOrderPreferences] = useState<
		OrderPreferences | undefined
	>(undefined);
	const preferredOrderInfo = ordersInfo.find(
		(info) => info.id === orderPreferences?.orderId,
	);
	const preferredCurrencyAddress = preferredOrderInfo?.data.currency;

	const userFunds = useUserFunds(
		(preferredCurrencyAddress ?? "0x0") as `0x${string}`,
	);
	const {
		data: { raw: rawBalanceInCurrency },
	} = userFunds;

	const [transactionReceipt, setTransactionReceipt] =
		useState<ContractTransactionReceipt | null>(null);

	if (
		!isConnected ||
		orderChainIdsSupportedByApp.length === 0 ||
		!isCurrentChainSupportedByApp ||
		!isCurrentChainSupportedByOrders
	) {
		return {
			title: "Complete the prerequisites",
			description: "Complete all the prerequisites to support this hypercert.",
			content: (
				<Prerequisites
					{...{
						isConnected,
						orderChainIdsSupportedByApp,
						isCurrentChainSupportedByApp,
						isCurrentChainSupportedByOrders,
					}}
				/>
			),
		};
	}

	if (variant === "amount-options") {
		return {
			title: "Choose an amount",
			description: "Choose your desired amount to fund this hypercert.",
			content: (
				<AmountOptions
					{...{
						hypercert: hypercert as FullHypercertWithOrder,
						orderPreferencesState: [orderPreferences, setOrderPreferences],
						userFunds,
					}}
				/>
			),
			nextButton: (
				<Button
					disabled={
						preferredOrderInfo === undefined ||
						orderPreferences === undefined ||
						orderPreferences.units <= 0n ||
						orderPreferences.units > hypercert.unitsForSale ||
						(rawBalanceInCurrency !== undefined &&
							rawBalanceInCurrency <
								preferredOrderInfo.pricePerUnit.inToken.precisionMultiplied *
									orderPreferences.units)
					}
					onClick={() => setVariant("transaction-progress")}
				>
					Continue
				</Button>
			),
		};
	}

	if (
		preferredOrderInfo === undefined ||
		orderPreferences === undefined ||
		orderPreferences.units <= 0n ||
		orderPreferences.units > hypercert.unitsForSale ||
		(rawBalanceInCurrency !== undefined &&
			rawBalanceInCurrency <
				preferredOrderInfo.pricePerUnit.inToken.precisionMultiplied *
					orderPreferences.units)
	) {
		return InvalidPaymentFlowUIConfig;
	}

	if (variant === "transaction-progress") {
		return {
			title: "Transaction Status",
			description: "View the status of your transaction.",
			content: (
				<TransactionProgress
					{...{
						hypercert,
						orderPreferences,
						setVariant,
						transactionReceiptState: [
							transactionReceipt,
							setTransactionReceipt,
						],
					}}
				/>
			),
			setVariant,
			transactionReceipt: transactionReceipt ?? undefined,
		};
	}

	return InvalidPaymentFlowUIConfig;
};

export default usePaymentFlowDialog;
