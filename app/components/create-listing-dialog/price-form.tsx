import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	type Currency,
	SUPPORTED_CURRENCIES,
} from "@hypercerts-org/marketplace-sdk";
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
	currencyOptions,
	currencyState,
}: {
	priceState: [number, Dispatch<SetStateAction<number>>];
	priceValidityErrorState: [
		string | null,
		Dispatch<SetStateAction<string | null>>,
	];
	currencyOptions: Array<Currency>;
	currencyState: [
		Currency | undefined,
		Dispatch<SetStateAction<Currency | undefined>>,
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
					}}
				/>
				<Combobox
					options={currencyOptions.map((currency) => ({
						label: currency.symbol,
						value: currency.symbol,
					}))}
					value={selectedCurrency?.symbol}
					onChange={(value) => {
						setSelectedCurrency(
							currencyOptions.find((currency) => currency.symbol === value),
						);
					}}
					placeholder="Select a currency"
					emptyLabel="No currencies supported"
					searchPlaceholder="Search for a currency"
				/>
			</div>
			{priceValidityError && (
				<p className="text-destructive text-sm">{priceValidityError}</p>
			)}
		</div>
	);
};

export default PriceForm;
