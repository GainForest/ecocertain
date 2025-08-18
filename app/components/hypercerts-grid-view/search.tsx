import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowDown,
	ArrowUp,
	Clock,
	Search as SearchIcon,
	SortAsc,
	SortDesc,
} from "lucide-react";
import type React from "react";

export type SortKey = "date" | "price" | "totalSales";
export type SortOption = {
	key: SortKey;
	order: "asc" | "desc";
};

const SORT_OPTIONS = [
	{ value: "date", label: "By date created" },
	{ value: "totalSales", label: "By funds raised" },
	{ value: "price", label: "By funding goal" },
];

const Search = ({
	inputState,
	sortOptionsState,
}: {
	inputState: [string, React.Dispatch<React.SetStateAction<string>>];
	sortOptionsState: [
		SortOption,
		React.Dispatch<React.SetStateAction<SortOption>>,
	];
}) => {
	const [input, setInput] = inputState;
	const [sortOptions, setSortOptions] = sortOptionsState;

	return (
		<div className="mb-4 flex w-full scale-100 flex-col items-center justify-center px-4">
			<motion.div
				className="w-full max-w-3xl"
				initial={{ opacity: 0, filter: "blur(10px)", y: "100" }}
				animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
				transition={{
					duration: 0.5,
					delay: 0.2,
				}}
			>
				<div className="relative z-[10] w-full">
					<AnimatePresence>
						{input === "" && (
							<motion.span
								className="absolute top-1/2 left-4 text-muted-foreground"
								initial={{
									opacity: 0,
									filter: "blur(10px)",
									x: -20,
									y: "-50%",
								}}
								animate={{ opacity: 1, filter: "blur(0px)", x: 0, y: "-50%" }}
								exit={{ opacity: 0, filter: "blur(10px)", x: 20, y: "-50%" }}
								transition={{ duration: 0.3 }}
							>
								<SearchIcon className="text-lg" />
							</motion.span>
						)}
					</AnimatePresence>
					<Input
						type="text"
						placeholder="Search ecocerts by title or summary"
						className={cn(
							"h-16 w-full bg-background px-4 text-lg shadow-lg",
							input === "" ? "pl-12" : "",
						)}
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
				</div>
				<motion.div className="-mt-2 z-[5] w-full rounded-t-0 rounded-b-lg border border-border bg-background/80 p-1 pt-3">
					<div className="flex w-full items-center justify-between px-2 py-1 font-sans">
						<Combobox
							options={SORT_OPTIONS}
							value={sortOptions.key}
							onChange={(val) => {
								setSortOptions({ ...sortOptions, key: val as SortKey });
							}}
							placeholder="Sort by"
							className="min-w-[160px]"
						/>
						<div className="flex flex-row overflow-hidden rounded-lg border border-border">
							<Button
								variant={sortOptions.order === "asc" ? "secondary" : "ghost"}
								size="sm"
								onClick={() => setSortOptions({ ...sortOptions, order: "asc" })}
								className={cn(
									"rounded-none border-b-2",
									sortOptions.order === "asc"
										? "border-primary"
										: "border-transparent",
								)}
								aria-pressed={sortOptions.order === "asc"}
							>
								<SortAsc className="h-4 w-4" />
							</Button>
							<Button
								variant={sortOptions.order === "desc" ? "secondary" : "ghost"}
								size="sm"
								onClick={() =>
									setSortOptions({ ...sortOptions, order: "desc" })
								}
								className={cn(
									"rounded-none border-b-2",
									sortOptions.order === "desc"
										? "border-primary"
										: "border-transparent",
								)}
								aria-pressed={sortOptions.order === "desc"}
							>
								<SortDesc className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default Search;
