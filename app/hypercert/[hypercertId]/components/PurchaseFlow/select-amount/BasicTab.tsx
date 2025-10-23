import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Button } from "../../../../../../components/ui/button";
import usePurchaseFlowStore from "../store";
import { calcUnitsFromUSD } from "../utils/calcUnitsFromUSD";

const quickAmounts = [
	{ usd: 1, emojis: "🌱" },
	{ usd: 5, emojis: "🌱⭐" },
	{ usd: 10, emojis: "🌱⭐✨" },
	{ usd: 50, emojis: "🌱⭐✨💕" },
	{ usd: 100, emojis: "🌱⭐✨💕💚" },
	{ usd: 500, emojis: "🌱⭐✨💕💚🤟" },
];

const getInitialAmounts = (
	pricePerPercentInUSD: number,
	totalUnitsInOrder: bigint,
	userFundsInUnits: bigint,
): number => {
	const totalPrice = pricePerPercentInUSD * 100;
	for (let i = quickAmounts.length / 2; i >= 0; i--) {
		if (
			totalPrice >= quickAmounts[i].usd &&
			calcUnitsFromUSD(
				quickAmounts[i].usd,
				totalUnitsInOrder,
				pricePerPercentInUSD,
			) <= userFundsInUnits
		)
			return quickAmounts[i].usd;
	}
	return quickAmounts[0].usd;
};

const BasicTab = ({
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

	// biome-ignore lint/correctness/useExhaustiveDependencies(setAmountSelectedInUnits): setAmountSelectedInUnits should not be a trigger for this side effect.
	useEffect(() => {
		const basicAmountSelectedInUnits = amountSelectedInUnits.basic;
		if (basicAmountSelectedInUnits !== null) return;
		if (!selectedOrder) return;
		setAmountSelectedInUnits({
			...amountSelectedInUnits,
			basic: calcUnitsFromUSD(
				getInitialAmounts(
					selectedOrder.pricePerPercentInUSD,
					totalUnitsInOrder,
					fundsByUserInUnits,
				),
				totalUnitsInOrder,
				selectedOrder.pricePerPercentInUSD,
			),
		});
	}, [amountSelectedInUnits, selectedOrder, totalUnitsInOrder]);

	if (!selectedOrder) return null;

	return (
		<div className="flex flex-col gap-2">
			<div className="mb-2 grid grid-cols-2 gap-1">
				{quickAmounts.map((qa) => {
					const unitsForButton = selectedOrder
						? calcUnitsFromUSD(
								qa.usd,
								totalUnitsInOrder,
								selectedOrder.pricePerPercentInUSD,
						  )
						: 0n;
					const isSelected = amountSelectedInUnits.basic === unitsForButton;
					const isDisabled = unitsForButton > totalUnitsInOrder;
					return (
						<Button
							key={qa.usd}
							variant={"outline"}
							className={cn(
								"flex h-10 w-full flex-col items-center",
								isSelected && "border-primary bg-primary/10",
								isDisabled && "cursor-not-allowed opacity-50",
							)}
							onClick={() =>
								!isDisabled &&
								setAmountSelectedInUnits({
									...amountSelectedInUnits,
									basic: unitsForButton,
								})
							}
							disabled={isDisabled}
						>
							<span className="flex w-full items-center justify-between">
								<span className="font-semibold">${qa.usd}</span>
								<span className="text-xs">{qa.emojis}</span>
							</span>
						</Button>
					);
				})}
			</div>
			{amountSelectedInUnits.basic !== null &&
				fundsByUserInUnits < amountSelectedInUnits.basic && (
					<div className="flex items-center justify-center rounded-lg bg-muted py-1 text-center text-red-500 text-sm">
						Insufficient Balance
					</div>
				)}
		</div>
	);
};

export default BasicTab;
