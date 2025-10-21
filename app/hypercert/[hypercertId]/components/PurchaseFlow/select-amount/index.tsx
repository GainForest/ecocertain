"use client";

import ErrorModalBody from "@/components/modals/error-body";
import { useModal } from "@/components/ui/modal/context";
import { fetchFractionById } from "@/graphql/hypercerts/queries/fractions";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import useUserFunds from "@/hooks/use-user-funds";
import { cn, getCrossChainPortfolio } from "@/lib/utils";
import type { Currency } from "@hypercerts-org/marketplace-sdk";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Info, Loader2, Percent, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatEther } from "viem";
import { arbitrum, celo, mainnet } from "viem/chains";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { Button } from "../../../../../../components/ui/button";
import {
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "../../../../../../components/ui/modal/modal";
import Paymentprogress from "../payment-progress";
import usePurchaseFlowStore from "../store";
import { calcUnitsFromTokens } from "../utils/calcUnitsFromTokens";
import BasicTab from "./BasicTab";
import CustomTab from "./CustomTab";
import PercentageTab from "./PercentageTab";

const NATIVE_BY_CHAIN: Record<number, { symbol: string; decimals: number }> = {
	[mainnet.id]: { symbol: "ETH", decimals: 18 },
	[arbitrum.id]: { symbol: "ETH", decimals: 18 },
	[celo.id]: { symbol: "CELO", decimals: 18 },
};

const AnimatedTabContent = ({ children }: { children: React.ReactNode }) => {
	return (
		<motion.div
			className="w-full"
			initial={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
			animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
			exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
			transition={{ duration: 0.2 }}
		>
			{children}
		</motion.div>
	);
};

const SelectAmount = () => {
	const hypercert = usePurchaseFlowStore((state) => state.hypercert);
	const selectedOrder = usePurchaseFlowStore((state) => state.selectedOrder);
	const currency = usePurchaseFlowStore((state) => state.currency);
	const { popModal } = useModal();
	return (
		<ModalContent dismissible={false} className="font-sans">
			<ModalHeader className="flex items-center gap-4">
				<Button
					variant={"secondary"}
					size={"sm"}
					className="h-6 w-6 rounded-full p-0.5"
					onClick={() => popModal()}
				>
					<ChevronLeft />
				</Button>
				<div>
					<ModalTitle>Purchase Ecocert</ModalTitle>
					<ModalDescription>Select the amount to purchase</ModalDescription>
				</div>
			</ModalHeader>
			{!hypercert || !selectedOrder || !currency ? (
				<ErrorModalBody ctaText="Go back" ctaAction={() => popModal()} />
			) : (
				<SelectAmountBody
					hypercert={hypercert}
					selectedOrder={selectedOrder}
					currency={currency}
				/>
			)}
		</ModalContent>
	);
};

const TABS = ["basic", "custom", "percentage"] as const;
type TabType = (typeof TABS)[number];

const SelectAmountBody = ({
	hypercert,
	selectedOrder,
	currency,
}: {
	hypercert: FullHypercert;
	selectedOrder: FullHypercert["orders"][number];
	currency: Currency;
}) => {
	const { address } = useAccount();

	const { hide, pushModalByVariant } = useModal();
	const [portfolio, setPortfolio] = useState<
		Array<{
			chainId: number;
			chainName: string;
			supportedForTrading: boolean;
			native: bigint; // wei
			erc20s: Array<{ symbol: string; value: string }>;
		}>
	>([]);

	const [portfolioLoading, setPortfolioLoading] = useState(false);

	useEffect(() => {
		let mounted = true;
		if (!address) return;

		setPortfolioLoading(true);
		getCrossChainPortfolio(address as `0x${string}`)
			.then((res) => {
				if (!mounted) return;
				setPortfolio(res);
			})
			.finally(() => mounted && setPortfolioLoading(false));

		return () => {
			mounted = false;
		};
	}, [address]);
	const nonZeroAssets = useMemo(() => {
		const items: Array<{
			chainId: number;
			chainName: string;
			token: string; // symbol
			amount: string; // formatted string
			isNative: boolean;
			supportedForTrading: boolean;
		}> = [];

		for (const row of portfolio) {
			// native
			const nativeMeta = NATIVE_BY_CHAIN[row.chainId];
			if (nativeMeta) {
				const nativeAmount = Number(formatEther(row.native));
				if (nativeAmount > 0) {
					items.push({
						chainId: row.chainId,
						chainName: row.chainName,
						token: nativeMeta.symbol,
						amount: nativeAmount.toLocaleString(),
						isNative: true,
						supportedForTrading: row.supportedForTrading,
					});
				}
			}

			// erc20s
			for (const t of row.erc20s) {
				const amt = Number.parseFloat(t.value);
				if (amt > 0) {
					items.push({
						chainId: row.chainId,
						chainName: row.chainName,
						token: t.symbol,
						amount: amt.toLocaleString(),
						isNative: false,
						supportedForTrading: row.supportedForTrading,
					});
				}
			}
		}
		return items;
	}, [portfolio]);

	const selectedTab: TabType = usePurchaseFlowStore(
		(state) => state.amountSelectionCurrentTab,
	);
	const setSelectedTab: (tab: TabType) => void = usePurchaseFlowStore(
		(state) => state.setAmountSelectionCurrentTab,
	);
	const amountSelectedInUnits = usePurchaseFlowStore(
		(state) => state.amountSelectedInUnits,
	);

	// --- User Balance ---
	const userFunds = useUserFunds(selectedOrder?.currency as `0x${string}`);
	const balance = userFunds.data.formatted ?? "-";
	const isBalanceLoading = userFunds.isLoading;
	const handleBalanceRefresh = () => userFunds.refetch();
	const handleContinue = () => {
		pushModalByVariant({
			id: "purchase-flow-payment-progress",
			content: <Paymentprogress />,
		});
	};

	const totalUnitsInOrder = hypercert.totalUnits;
	const fundsByUserInUnits = calcUnitsFromTokens(
		Number(userFunds.data.formatted ?? "0"),
		totalUnitsInOrder,
		selectedOrder.pricePerPercentInToken,
	);

	// --- UI ---
	return (
		<>
			<div className="my-6 flex flex-col gap-2">
				{/* Tab Group */}
				<div className="mb-2 flex items-center gap-2">
					<div className="flex flex-1 gap-0.5 rounded-lg border border-border/30 bg-muted/20 p-0.5">
						{(["basic", "custom"] satisfies TabType[]).map((tab) => (
							<Button
								key={tab}
								size={"sm"}
								variant={selectedTab === tab ? "secondary" : "ghost"}
								className={cn(
									"flex-1 px-2 py-1 font-semibold text-sm capitalize",
									selectedTab === tab
										? "bg-primary/10 text-primary"
										: "text-muted-foreground",
								)}
								onClick={() => setSelectedTab(tab)}
							>
								{tab}
							</Button>
						))}
					</div>
					<div className="flex gap-0.5 rounded-lg border border-border/30 bg-muted/20 p-0.5">
						<Button
							size={"sm"}
							variant={selectedTab === "percentage" ? "secondary" : "ghost"}
							className={cn(
								"px-2 py-1 font-semibold text-sm capitalize",
								selectedTab === "percentage"
									? "bg-primary/10 text-primary"
									: "text-muted-foreground",
							)}
							onClick={() => setSelectedTab("percentage")}
						>
							<Percent className="size-4" />
						</Button>
					</div>
				</div>
				{/* Choose an amount label and balance */}
				<div className="flex items-center justify-between">
					<span className="mb-1 font-bold text-sm">Choose an amount</span>
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground text-xs">
							Balance: {isBalanceLoading ? "..." : balance} {currency?.symbol}
						</span>
						<Button
							variant={"ghost"}
							size={"sm"}
							className="h-auto w-8 p-1"
							onClick={handleBalanceRefresh}
							disabled={isBalanceLoading}
						>
							<RefreshCcw
								className={cn("size-3", isBalanceLoading && "animate-spin")}
							/>
						</Button>
					</div>
				</div>
				<AnimatePresence mode="wait">
					{selectedTab === "basic" && (
						<AnimatedTabContent key="basic">
							<BasicTab
								totalUnitsInOrder={totalUnitsInOrder}
								fundsByUserInUnits={fundsByUserInUnits}
							/>
						</AnimatedTabContent>
					)}
					{selectedTab === "custom" && (
						<AnimatedTabContent key="custom">
							<CustomTab
								totalUnitsInOrder={totalUnitsInOrder}
								fundsByUserInUnits={fundsByUserInUnits}
							/>
						</AnimatedTabContent>
					)}
					{selectedTab === "percentage" && (
						<AnimatedTabContent key="percentage">
							<PercentageTab
								totalUnitsInOrder={totalUnitsInOrder}
								fundsByUserInUnits={fundsByUserInUnits}
							/>
						</AnimatedTabContent>
					)}
				</AnimatePresence>
				{/* Info Box */}
				<div className="mt-2 flex items-start gap-2 rounded-lg border bg-muted/50 p-3 font-sans text-muted-foreground text-xs">
					<Info className="mt-0.5 h-4 w-4 shrink-0" />
					<p>
						All proceeds from the purchase of this ecocert go directly to the
						creator of the ecocert minus a small platform fee worth{" "}
						<span className="font-bold text-foreground">0.1 Celo</span>.
					</p>
				</div>
			</div>
			<ModalFooter className="flex flex-row items-center gap-2">
				<Button variant={"secondary"} className="flex-1" onClick={() => hide()}>
					Cancel
				</Button>
				<Button
					onClick={handleContinue}
					className="flex-1"
					disabled={
						amountSelectedInUnits[selectedTab] === null ||
						amountSelectedInUnits[selectedTab] <= 0 ||
						amountSelectedInUnits[selectedTab] > totalUnitsInOrder ||
						amountSelectedInUnits[selectedTab] > fundsByUserInUnits
					}
				>
					Continue
				</Button>
			</ModalFooter>
		</>
	);
};

export default SelectAmount;
