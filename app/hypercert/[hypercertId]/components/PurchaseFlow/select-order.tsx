"use client";

import { useModal } from "@/components/ui/modal/context";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { formatCurrency } from "@/lib/utils";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { CheckCircle, CheckCircle2, Circle, CircleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "../../../../../components/ui/button";
import {
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "../../../../../components/ui/modal/modal";
import SelectAmount from "./select-amount";
import usePurchaseFlowStore from "./store";
import { getCurrencyFromAddress } from "./utils/getCurrencyFromAddress";

const SelectOrder = ({ hypercert }: { hypercert: FullHypercert }) => {
	const { address, chainId } = useAccount();
	const { open } = useWeb3Modal();
	const { hide, pushModalByVariant } = useModal();

	const setHypercert = usePurchaseFlowStore((state) => state.setHypercert);
	// biome-ignore lint/correctness/useExhaustiveDependencies(setHypercert): setHypercert should not be a trigger for this side effect.
	useEffect(() => {
		setHypercert(hypercert);
	}, [hypercert]);

	const selectedOrder = usePurchaseFlowStore((state) => state.selectedOrder);
	const setSelectedOrder = usePurchaseFlowStore(
		(state) => state.setSelectedOrder,
	);

	const validOrdersOnCurrentChain = useMemo(
		() =>
			hypercert.orders.filter(
				(order) =>
					order.invalidated === false && order.chainId === chainId?.toString(),
			),
		[hypercert.orders, chainId],
	);

	const handleOrderSelect = (order: FullHypercert["orders"][number]) => {
		setSelectedOrder(order);
	};

	const handleContinue = () => {
		pushModalByVariant({
			id: "purchase-flow-select-amount",
			content: <SelectAmount />,
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(setSelectedOrder, handleContinue): setSelectedOrder and handleContinue should not be a trigger for this side effect.
	useEffect(() => {
		if (!address) return;
		// If the order is not in the valid orders on the current chain, unset the selected order
		if (selectedOrder) {
			if (
				validOrdersOnCurrentChain.find((order) => order.id === selectedOrder.id)
			)
				return;
			setSelectedOrder(null);
			return;
		}
		// If the user has only one valid order and unselected, then select it and continue automatically
		if (validOrdersOnCurrentChain.length === 1) {
			setSelectedOrder(validOrdersOnCurrentChain[0]);
			handleContinue();
		}
	}, [address, validOrdersOnCurrentChain, selectedOrder]);

	return (
		<ModalContent dismissible={false} className="font-sans">
			<ModalHeader>
				<ModalTitle>Purchase Ecocert</ModalTitle>
				<ModalDescription>
					Select an order from the available orders
				</ModalDescription>
			</ModalHeader>
			<div className="my-6 flex flex-col gap-2">
				{!address && (
					<div className="flex flex-col items-center rounded-xl bg-muted p-4">
						<CircleAlert className="text-destructive opacity-50" />
						<span className="font-bold text-destructive">
							Wallet not connected
						</span>
						<span className="text-muted-foreground text-sm">
							Please connect your wallet to continue
						</span>
						<Button
							size={"sm"}
							className="mt-4 rounded-full"
							onClick={() => open()}
						>
							Connect Wallet
						</Button>
					</div>
				)}
				{address &&
					(validOrdersOnCurrentChain.length === 0 ? (
						<div className="flex flex-col items-center rounded-xl bg-muted p-4 py-8 text-muted-foreground text-sm">
							No orders found on this chain :{"("}
						</div>
					) : (
						<div className="flex flex-col gap-3">
							{validOrdersOnCurrentChain.map((order, index) => {
								const isSelected = selectedOrder?.id === order.id;
								const currency = chainId
									? getCurrencyFromAddress(chainId, order.currency)
									: undefined;

								if (!currency) return null;

								return (
									<button
										key={order.id}
										type="button"
										className={`w-full rounded-lg border p-2 text-left transition-all hover:border-primary/50${
											isSelected
												? "border-primary bg-primary/5"
												: "border-border hover:bg-muted/50"
										}`}
										onClick={() => handleOrderSelect(order)}
									>
										<div className="flex items-center gap-3">
											<div className="flex-shrink-0">
												{isSelected ? (
													<CheckCircle2 className="h-5 w-5 text-primary" />
												) : (
													<Circle className="h-5 w-5 text-muted-foreground" />
												)}
											</div>
											<div className="flex flex-1 flex-col">
												<div className="flex items-center justify-between">
													<span className="font-bold text-muted-foreground text-sm">
														Total Price:
													</span>
													<span className="font-mono text-muted-foreground text-xs">
														Order #{index + 1}
													</span>
												</div>
												<span>
													<span className="font-bold text-2xl text-primary">
														{(order.pricePerPercentInToken * 100).toFixed(
															4,
														)}{" "}
													</span>
													<span className="font-bold text-base">
														{currency?.symbol}
													</span>
												</span>
												<span className="font-mono text-muted-foreground text-xs">
													(${(order.pricePerPercentInUSD * 100).toFixed(2)})
												</span>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					))}
			</div>
			<ModalFooter>
				<Button disabled={!address || !selectedOrder} onClick={handleContinue}>
					Continue
				</Button>
				<Button variant={"secondary"} onClick={() => hide()}>
					Cancel
				</Button>
			</ModalFooter>
		</ModalContent>
	);
};

export default SelectOrder;
