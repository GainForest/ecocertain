import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import type { Currency } from "@hypercerts-org/marketplace-sdk";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getCurrencyFromAddress } from "./utils/getCurrencyFromAddress";

type PurchaseFlowState = {
	hypercert: FullHypercert | null;
	selectedOrder: FullHypercert["orders"][number] | null;
	currency: Currency | null;
	amountSelectedInUnits: {
		basic: bigint | null;
		custom: bigint | null;
		percentage: bigint | null;
	};
	amountSelectionCurrentTab: "basic" | "custom" | "percentage";
	customInputMode: "currency" | "usd";
};

type PurchaseFlowActions = {
	setHypercert: (hypercert: FullHypercert) => void;
	setSelectedOrder: (order: FullHypercert["orders"][number] | null) => void;
	setAmountSelectedInUnits: (amountSelectedInUnits: {
		basic: bigint | null;
		custom: bigint | null;
		percentage: bigint | null;
	}) => void;
	setAmountSelectionCurrentTab: (
		amountSelectionCurrentTab: "basic" | "custom" | "percentage",
	) => void;
	setCustomInputMode: (customInputMode: "currency" | "usd") => void;
};

const DEFAULT_STATE: PurchaseFlowState = {
	hypercert: null,
	selectedOrder: null,
	currency: null,
	amountSelectedInUnits: {
		basic: null,
		custom: null,
		percentage: null,
	},
	amountSelectionCurrentTab: "basic",
	customInputMode: "currency",
};

const isDevEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV === "development";

const usePurchaseFlowStore = create<PurchaseFlowState & PurchaseFlowActions>()(
	devtools(
		(set) => ({
			...DEFAULT_STATE,
			setHypercert: (hypercert) => set({ hypercert }),
			setSelectedOrder: (selectedOrder) =>
				set(() => {
					return {
						selectedOrder,
						currency: selectedOrder
							? getCurrencyFromAddress(
									Number.parseInt(selectedOrder.chainId),
									selectedOrder.currency,
							  )
							: null,
					};
				}),
			setAmountSelectedInUnits: (amountSelectedInUnits) =>
				set({ amountSelectedInUnits }),
			setAmountSelectionCurrentTab: (amountSelectionCurrentTab) =>
				set({ amountSelectionCurrentTab }),
			setCustomInputMode: (customInputMode) => set({ customInputMode }),
		}),
		{ enabled: isDevEnvironment },
	),
);

export default usePurchaseFlowStore;
