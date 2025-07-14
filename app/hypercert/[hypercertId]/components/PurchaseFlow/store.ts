import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import type { Currency } from "@hypercerts-org/marketplace-sdk";
import { create } from "zustand";
import { getCurrencyFromAddress } from "./utils/getCurrencyFromAddress";

type PurchaseFlowState = {
	hypercert: FullHypercert | null;
	selectedOrder: FullHypercert["orders"][number] | null;
	currency: Currency | null;
	totalUnitsInOrder: bigint | null;
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
	setSelectedOrder: (order: FullHypercert["orders"][number]) => void;
	setTotalUnitsInOrder: (totalUnitsInOrder: bigint) => void;
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
	totalUnitsInOrder: null,
	amountSelectedInUnits: {
		basic: null,
		custom: null,
		percentage: null,
	},
	amountSelectionCurrentTab: "basic",
	customInputMode: "currency",
};

const usePurchaseFlowStore = create<PurchaseFlowState & PurchaseFlowActions>(
	(set) => ({
		...DEFAULT_STATE,
		setHypercert: (hypercert) => set({ hypercert }),
		setSelectedOrder: (selectedOrder) =>
			set(() => {
				return {
					selectedOrder,
					currency: getCurrencyFromAddress(
						Number.parseInt(selectedOrder.chainId),
						selectedOrder.currency,
					),
				};
			}),
		setTotalUnitsInOrder: (totalUnitsInOrder) => set({ totalUnitsInOrder }),
		setAmountSelectedInUnits: (amountSelectedInUnits) =>
			set({ amountSelectedInUnits }),
		setAmountSelectionCurrentTab: (amountSelectionCurrentTab) =>
			set({ amountSelectionCurrentTab }),
		setCustomInputMode: (customInputMode) => set({ customInputMode }),
	}),
);

export default usePurchaseFlowStore;
