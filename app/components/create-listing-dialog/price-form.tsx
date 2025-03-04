import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES } from "@hypercerts-org/marketplace-sdk";
import { ChevronDown } from "lucide-react";
import React, {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useState,
} from "react";
const PriceForm = ({
	priceState,
	priceValidityErrorState,
	currencyState,
}: {
	priceState: [number, Dispatch<SetStateAction<number>>];
	priceValidityErrorState: [
		string | null,
		Dispatch<SetStateAction<string | null>>,
	];
	currencyState: [
		(typeof SUPPORTED_CURRENCIES)[number],
		Dispatch<SetStateAction<(typeof SUPPORTED_CURRENCIES)[number]>>,
	];
}) => {
	const [price, setPrice] = priceState;
	const [priceInputValue, setPriceInputValue] = useState<string>(
		price.toString(),
	);
	const [priceValidityError, setPriceValidityError] = priceValidityErrorState;
	const [selectedCurrency, setSelectedCurrency] = currencyState;

	useEffect(() => {
		try {
			const parsedValue = Number.parseFloat(priceInputValue);
			if (Number.isNaN(parsedValue)) {
				setPriceValidityError("Invalid price");
				return;
			}
			if (parsedValue <= 0) {
				setPriceValidityError("Price must be greater than 0");
				return;
			}
			if (parsedValue > 1000000) {
				setPriceValidityError("Price must be less than 1,000,000");
				return;
			}
			setPriceValidityError(null);
			setPrice(parsedValue);
		} catch (error) {
			setPriceValidityError("Invalid price");
		}
	}, [priceInputValue, setPrice, setPriceValidityError]);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<Input
					placeholder="Enter a price"
					className={cn("w-full", priceValidityError && "border-destructive")}
					value={priceInputValue}
					onChange={(e) => {
						setPriceInputValue(e.target.value);
						const value = e.target.value;
					}}
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="w-[100px] justify-between font-normal"
						>
							{selectedCurrency}
							<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[100px]">
						{SUPPORTED_CURRENCIES.map((currency) => (
							<DropdownMenuItem
								key={currency}
								onClick={() => setSelectedCurrency(currency)}
								className="cursor-pointer"
							>
								{currency}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			{priceValidityError && (
				<p className="text-destructive text-sm">{priceValidityError}</p>
			)}
		</div>
	);
};

export default PriceForm;
