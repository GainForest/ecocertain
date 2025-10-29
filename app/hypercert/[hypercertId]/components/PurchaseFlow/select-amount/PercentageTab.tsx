import { BigNumber } from "bignumber.js";
import { useEffect, useState } from "react";
import { Input } from "../../../../../../components/ui/input";
import usePurchaseFlowStore from "../store";
import { calcUnitsFromPercentage } from "../utils/calcUnitsFromPercentage";

const getInitialAmounts = (
	amountSelectedInUnits: bigint | null,
	totalUnitsInOrder: bigint,
): string => {
	const percentBn =
		amountSelectedInUnits === null
			? BigNumber(50)
			: BigNumber(amountSelectedInUnits.toString())
					.div(BigNumber(totalUnitsInOrder.toString()))
					.multipliedBy(100);
	return percentBn.toFixed(2);
};

const PercentageTab = ({
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
	const selectedOrder = usePurchaseFlowStore((state) => state.selectedOrder);
	const currency = usePurchaseFlowStore((state) => state.currency);
	const [percentageInput, setPercentageInput] = useState(
		getInitialAmounts(amountSelectedInUnits.percentage, totalUnitsInOrder),
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies(setAmountSelectedInUnits): setAmountSelectedInUnits should not be a trigger for this side effect.
	useEffect(() => {
		if (amountSelectedInUnits.percentage !== null) return;
		const parsed = Number.parseFloat(percentageInput);
		if (Number.isNaN(parsed)) return;
		const units = calcUnitsFromPercentage(parsed, totalUnitsInOrder) ?? 0n;
		setAmountSelectedInUnits({ ...amountSelectedInUnits, percentage: units });
	}, [amountSelectedInUnits, percentageInput, totalUnitsInOrder]);

	if (selectedOrder === null || currency === null) return null;
	const parsedPercentage = Number.parseFloat(percentageInput);
	const usdEquivalent = selectedOrder.pricePerPercentInUSD * parsedPercentage;
	const tokenEquivalent =
		selectedOrder.pricePerPercentInToken * parsedPercentage;
	return (
		<div className="flex flex-col rounded-lg border border-border bg-muted">
			<div className="relative w-full">
				<Input
					className="border-transparent border-b-border bg-background"
					type="number"
					min={0}
					max={100}
					value={percentageInput}
					onChange={(e) => {
						setPercentageInput(e.target.value.replace(",", "."));
						const parsed = Number.parseFloat(e.target.value);
						if (Number.isNaN(parsed)) {
							setAmountSelectedInUnits({
								...amountSelectedInUnits,
								percentage: null,
							});
						} else {
							setAmountSelectedInUnits({
								...amountSelectedInUnits,
								percentage: calcUnitsFromPercentage(parsed, totalUnitsInOrder),
							});
						}
					}}
				/>
				<span className="absolute top-1 right-1 bottom-1 flex items-center bg-background pr-2 font-bold text-muted-foreground text-xs">
					%
				</span>
			</div>
			<div className="flex items-center justify-between px-2 py-0.5">
				{Number.isNaN(parsedPercentage) ||
				parsedPercentage < 0 ||
				parsedPercentage > 100 ? (
					<span className="text-destructive text-xs">
						Enter a value between 0 and 100
					</span>
				) : amountSelectedInUnits.percentage !== null &&
				  amountSelectedInUnits.percentage > fundsByUserInUnits ? (
					<span className="text-destructive text-xs">Insufficient Balance</span>
				) : (
					<>
						<span className="text-primary text-xs">
							USD {usdEquivalent.toFixed(2)}
						</span>
						<span className="text-primary text-xs">
							{tokenEquivalent.toFixed(4)} {currency.symbol}
						</span>
					</>
				)}
			</div>
		</div>
	);
};

export default PercentageTab;
