import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import BigNumber from "bignumber.js";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../../../../components/ui/button";
import { Input } from "../../../../../../components/ui/input";
import usePurchaseFlowStore from "../store";
import { calcUnitsFromTokens } from "../utils/calcUnitsFromTokens";
import { calcUnitsFromUSD } from "../utils/calcUnitsFromUSD";

const getInitialAmounts = (
	selectedOrder: FullHypercert["orders"][number] | null,
	amountSelectedInUnits: bigint | null,
	totalUnitsInOrder: bigint,
): {
	token: string;
	usd: string;
} => {
	if (selectedOrder === null) return { token: "", usd: "" };
	const percentBn =
		amountSelectedInUnits === null
			? BigNumber(50)
			: BigNumber(amountSelectedInUnits.toString())
					.div(BigNumber(totalUnitsInOrder.toString()))
					.multipliedBy(100);
	return {
		token: BigNumber(selectedOrder.pricePerPercentInToken)
			.multipliedBy(percentBn)
			.toFixed(4),
		usd: BigNumber(selectedOrder.pricePerPercentInUSD)
			.multipliedBy(percentBn)
			.toFixed(2),
	};
};

const CustomTab = ({
	totalUnitsInOrder,
	fundsByUserInUnits,
}: {
	totalUnitsInOrder: bigint;
	fundsByUserInUnits: bigint;
}) => {
	const amountSelectedInUnits = usePurchaseFlowStore(
		(state) => state.amountSelectedInUnits,
	);
	const setAmountSelectedInUnits = usePurchaseFlowStore(
		(state) => state.setAmountSelectedInUnits,
	);
	const customInputMode = usePurchaseFlowStore(
		(state) => state.customInputMode,
	);
	const setCustomInputMode = usePurchaseFlowStore(
		(state) => state.setCustomInputMode,
	);
	const currency = usePurchaseFlowStore((state) => state.currency);
	const selectedOrder = usePurchaseFlowStore((state) => state.selectedOrder);
	const initialAmounts = useMemo(() => {
		return getInitialAmounts(
			selectedOrder,
			amountSelectedInUnits.custom,
			totalUnitsInOrder,
		);
	}, [selectedOrder, amountSelectedInUnits.custom, totalUnitsInOrder]);
	const [currencyInput, setCurrencyInput] = useState(initialAmounts.token);
	const [usdInput, setUsdInput] = useState(initialAmounts.usd);

	// biome-ignore lint/correctness/useExhaustiveDependencies(setAmountSelectedInUnits): setAmountSelectedInUnits should not be a trigger for this side effect.
	useEffect(() => {
		if (amountSelectedInUnits.custom !== null) return;
		if (selectedOrder === null) return;
		const parsed = Number.parseFloat(currencyInput);
		if (Number.isNaN(parsed)) return;
		const units = calcUnitsFromTokens(
			parsed,
			totalUnitsInOrder,
			selectedOrder.pricePerPercentInToken,
		);
		setAmountSelectedInUnits({ ...amountSelectedInUnits, custom: units });
	}, [amountSelectedInUnits, currencyInput, totalUnitsInOrder, selectedOrder]);

	if (!selectedOrder || !currency) return null;

	// Conversion logic
	const pricePerPercentInUSD = selectedOrder.pricePerPercentInUSD;
	const pricePerPercentInToken = selectedOrder.pricePerPercentInToken;

	let displayValue = "";
	if (customInputMode === "currency") {
		if (currencyInput === "") {
			displayValue = "Start typing";
		} else {
			const parsed = Number.parseFloat(currencyInput);
			if (!Number.isNaN(parsed)) {
				// Convert token to USD
				const usd = (parsed / pricePerPercentInToken) * pricePerPercentInUSD;
				displayValue = `USD ${usd.toFixed(2)}`;
			} else {
				displayValue = "Invalid value";
			}
		}
	} else {
		if (usdInput === "") {
			displayValue = "Start typing";
		} else {
			const parsed = Number.parseFloat(usdInput);
			if (!Number.isNaN(parsed)) {
				// Convert USD to token
				const token = (parsed / pricePerPercentInUSD) * pricePerPercentInToken;
				displayValue = `${token.toFixed(4)} ${currency.symbol}`;
			} else {
				displayValue = "Invalid value";
			}
		}
	}

	// Mode switch handler
	const handleModeSwitch = () => {
		if (customInputMode === "currency") {
			// Switching to USD mode
			const parsed = Number.parseFloat(currencyInput);
			if (!Number.isNaN(parsed)) {
				const usd = (parsed / pricePerPercentInToken) * pricePerPercentInUSD;
				setUsdInput(usd.toFixed(2));
			} else {
				setUsdInput("");
			}
			setCustomInputMode("usd");
		} else {
			// Switching to currency mode
			const parsed = Number.parseFloat(usdInput);
			if (!Number.isNaN(parsed)) {
				const token = (parsed / pricePerPercentInUSD) * pricePerPercentInToken;
				setCurrencyInput(token.toFixed(4));
			} else {
				setCurrencyInput("");
			}
			setCustomInputMode("currency");
		}
	};

	return (
		<div className="flex flex-col rounded-lg border border-border bg-muted">
			<div className="relative w-full">
				<Input
					className="border-transparent border-b-border bg-background"
					type="number"
					lang="en-US"
					min={0}
					value={customInputMode === "currency" ? currencyInput : usdInput}
					onChange={(e) => {
						// sometimes based on locale/browser settings the decimal separator is a comma.
						const value = e.target.value.replace(",", ".");
						const parsed = Number.parseFloat(value);
						let units: bigint | null = null;
						if (customInputMode === "currency") {
							setCurrencyInput(value);
							units = Number.isNaN(parsed)
								? null
								: calcUnitsFromTokens(
										parsed,
										totalUnitsInOrder,
										pricePerPercentInToken,
								  );
						} else {
							setUsdInput(value);
							units = Number.isNaN(parsed)
								? null
								: calcUnitsFromUSD(
										parsed,
										totalUnitsInOrder,
										pricePerPercentInUSD,
								  );
						}
						console.log("units", units);
						setAmountSelectedInUnits({
							...amountSelectedInUnits,
							custom: units,
						});
					}}
				/>
				<span className="absolute top-1 right-1 bottom-1 flex items-center bg-background pr-2 font-bold text-muted-foreground text-xs">
					{customInputMode === "currency" ? currency.symbol : "USD"}
				</span>
			</div>
			<div className="flex items-center justify-between px-2 py-0.5">
				{amountSelectedInUnits.custom !== null &&
				amountSelectedInUnits.custom > totalUnitsInOrder ? (
					<span className="text-destructive text-xs">
						Max{" "}
						{customInputMode === "currency"
							? (pricePerPercentInUSD * 100).toFixed(2)
							: (pricePerPercentInToken * 100).toFixed(4)}{" "}
						{customInputMode === "currency" ? currency.symbol : "USD"}
					</span>
				) : amountSelectedInUnits.custom !== null &&
				  amountSelectedInUnits.custom > fundsByUserInUnits ? (
					<span className="text-destructive text-xs">Insufficient Balance</span>
				) : (
					<span className="text-primary text-xs">{displayValue}</span>
				)}
				<Button
					variant={"ghost"}
					size={"sm"}
					className="h-auto px-2 py-0.5 text-muted-foreground text-xs"
					onClick={handleModeSwitch}
				>
					{customInputMode === "currency"
						? "Enter in USD instead"
						: `Enter in ${currency?.symbol} instead`}
				</Button>
			</div>
		</div>
	);
};

export default CustomTab;
