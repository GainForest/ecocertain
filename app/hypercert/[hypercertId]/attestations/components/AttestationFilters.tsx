"use client";

import AddAttestationDialog from "@/app/components/add-attestation-dialog";
import useFullHypercert from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Search, SortAsc, SortDesc } from "lucide-react";

type SortOption = "newest" | "oldest";

export default function AttestationFilters({
	searchState,
	sortState,
	showCreatorOnlyState,
}: {
	searchState: [string, (value: string) => void];
	sortState: [SortOption, (value: SortOption) => void];
	showCreatorOnlyState: [boolean, (value: boolean) => void];
}) {
	const [searchQuery, setSearchQuery] = searchState;
	const [sort, setSort] = sortState;
	const [showCreatorOnly, setShowCreatorOnly] = showCreatorOnlyState;

	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div className="relative flex-1">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search proof of impact"
					className="bg-background pl-9"
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
					}}
				/>
			</div>
			<div className="flex flex-wrap items-center gap-4">
				<Select
					onValueChange={(value) => setSort(value as SortOption)}
					defaultValue="newest"
				>
					<SelectTrigger className="w-[180px] bg-background">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent className="bg-background">
						<SelectItem value="newest" className="hover:bg-accent">
							<div className="flex items-center gap-2">
								<SortDesc className="h-4 w-4" />
								Newest first
							</div>
						</SelectItem>
						<SelectItem value="oldest" className="hover:bg-accent">
							<div className="flex items-center gap-2">
								<SortAsc className="h-4 w-4" />
								Oldest first
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
				<div className="flex items-center gap-2">
					<Switch
						id="creator-only"
						checked={showCreatorOnly}
						onCheckedChange={(checked) => {
							setShowCreatorOnly(checked);
						}}
					/>
					<Label htmlFor="creator-only">Creator only</Label>
				</div>
			</div>
		</div>
	);
}
