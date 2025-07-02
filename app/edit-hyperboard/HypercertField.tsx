"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	type Hypercert,
	fetchHypercertById,
} from "@/graphql/hypercerts/queries/hypercerts";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface HypercertFieldProps {
	hypercerts: string[];
	setHypercerts: React.Dispatch<React.SetStateAction<string[]>>;
}

const HypercertPreview: React.FC<{ id: string }> = ({ id }) => {
	const [data, setData] = useState<Hypercert | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		fetchHypercertById(id)
			.then((res) => {
				if (!cancelled) {
					setData(res);
					setLoading(false);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError("Not found");
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [id]);

	return (
		<div className="pt-2">
			{loading ? (
				<div className="text-muted-foreground text-sm">Loading...</div>
			) : error ? (
				<div className="text-destructive text-sm">{error}</div>
			) : data ? (
				<div className="flex items-center gap-4">
					<img
						src={`/api/hypercert-image/${data.hypercertId}`}
						alt={data.name || "Untitled"}
						className="h-16 w-16 rounded-md border object-cover"
					/>
					<div className="min-w-0 flex-1">
						<div className="truncate font-semibold">
							{data.name || "Untitled"}
						</div>
						<div className="truncate text-muted-foreground text-xs">
							{data.description || "No description"}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};

const HypercertCard: React.FC<{ id: string; onRemove: () => void }> = ({
	id,
	onRemove,
}) => (
	<div className="mb-2 flex flex-col rounded-lg border bg-white p-3 font-sans dark:bg-black">
		{/* Top section: input + trash icon */}
		<div className="mb-2 flex items-center gap-2 border-b pb-2">
			<Input
				value={id}
				readOnly
				className="flex-1 bg-white font-sans dark:bg-black"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={onRemove}
				className="ml-auto font-sans"
			>
				<Trash2 className="h-5 w-5 text-destructive" />
			</Button>
		</div>
		{/* Bottom section: preview */}
		<HypercertPreview id={id} />
	</div>
);

const HypercertField: React.FC<HypercertFieldProps> = ({
	hypercerts,
	setHypercerts,
}) => {
	const [input, setInput] = useState("");
	const [addError, setAddError] = useState<string | null>(null);
	const [debouncedInput, setDebouncedInput] = useState(input);

	// Debounce input
	useEffect(() => {
		const handler = setTimeout(() => setDebouncedInput(input), 300);
		return () => clearTimeout(handler);
	}, [input]);

	const handleAdd = () => {
		if (!debouncedInput.trim()) return;
		if (hypercerts.includes(debouncedInput.trim())) {
			setAddError("Already added");
			return;
		}
		setHypercerts([...hypercerts, debouncedInput.trim()]);
		setInput("");
		setAddError(null);
	};

	return (
		<div className="font-sans">
			<div className="mb-4 flex items-center gap-2">
				<Input
					placeholder="Enter Hypercert ID"
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
						setAddError(null);
					}}
					className="flex-1 bg-white font-sans dark:bg-black"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleAdd();
						}
					}}
				/>
				<Button
					type="button"
					variant="secondary"
					onClick={handleAdd}
					className="font-sans"
				>
					Add
				</Button>
			</div>
			{addError && (
				<div className="mb-2 font-sans text-destructive text-xs">
					{addError}
				</div>
			)}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{hypercerts.length === 0 && (
					<div className="col-span-full mb-2 font-sans text-muted-foreground text-sm">
						No hypercerts added yet.
					</div>
				)}
				{hypercerts.map((id) => (
					<HypercertCard
						key={id}
						id={id}
						onRemove={() => setHypercerts(hypercerts.filter((h) => h !== id))}
					/>
				))}
			</div>
		</div>
	);
};

export default HypercertField;
