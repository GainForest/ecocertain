"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ComboboxOption = {
	value: string;
	label: string;
};

export function Combobox({
	options,
	placeholder,
	allowNoSelection = false,
	emptyLabel,
	searchPlaceholder,
	value,
	onChange,
	popoverClassName,
	...props
}: Omit<ButtonProps, "onChange"> & {
	options: ComboboxOption[];
	placeholder?: string;
	emptyLabel?: string;
	searchPlaceholder?: string;
	allowNoSelection?: boolean;
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	popoverClassName?: string;
}) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					{...props}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("justify-between font-sans", props.className)}
				>
					{value
						? options.find((option) => option.value === value)?.label
						: placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={cn(
					"pointer-events-auto relative z-[100] w-[200px] p-0 font-sans",
					popoverClassName,
				)}
			>
				<Command>
					<CommandInput placeholder={searchPlaceholder ?? "Search..."} />
					<CommandList>
						<CommandEmpty>{emptyLabel ?? "No results"}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={(currentValue) => {
										onChange(
											currentValue === value
												? allowNoSelection
													? undefined
													: value
												: currentValue,
										);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
