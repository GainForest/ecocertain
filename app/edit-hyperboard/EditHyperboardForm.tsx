"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Hyperboard } from "@/graphql/hypercerts/queries/hyperboard";
import type React from "react";
import { useState } from "react";
import { z } from "zod";
import HypercertField from "./HypercertField";

const schema = z.object({
	title: z.string().min(1, "Title is required").max(100, "Max 100 characters"),
	description: z
		.string()
		.min(1, "Description is required")
		.max(500, "Max 500 characters"),
	hypercerts: z.array(z.string().min(1, "ID required")),
});

export default function EditHyperboardForm({
	initialData,
}: {
	initialData: Hyperboard;
}) {
	const [title, setTitle] = useState(initialData?.title || "");
	const [description, setDescription] = useState(
		initialData?.collection?.description || "",
	);
	const [hypercerts, setHypercerts] = useState<string[]>(
		initialData?.collection?.hypercerts?.map((h) => h.hypercertId) || [],
	);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const result = schema.safeParse({ title, description, hypercerts });
		if (!result.success) {
			const fieldErrors: { [key: string]: string } = {};
			for (const issue of result.error.issues) {
				if (issue.path[0]) fieldErrors[issue.path[0]] = issue.message;
			}
			setErrors(fieldErrors);
			return;
		}
		setErrors({});
		// TODO: submit logic
		alert("Collection updated! (not implemented)");
	};

	return (
		<form className="space-y-8 font-sans" onSubmit={handleSubmit}>
			<div>
				<Label htmlFor="title" className="font-sans">
					Title*
				</Label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					maxLength={100}
					required
					className="mt-1 bg-white font-sans dark:bg-black"
				/>
				<div className="mt-1 font-sans text-muted-foreground text-sm">
					Max. 100 characters
				</div>
				{errors.title && (
					<div className="font-sans text-destructive text-sm">
						{errors.title}
					</div>
				)}
			</div>
			<div>
				<Label htmlFor="description" className="font-sans">
					Description*
				</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					maxLength={500}
					required
					className="mt-1 bg-white font-sans dark:bg-black"
				/>
				<div className="mt-1 font-sans text-muted-foreground text-sm">
					Max. 500 characters
				</div>
				{errors.description && (
					<div className="font-sans text-destructive text-sm">
						{errors.description}
					</div>
				)}
			</div>
			<div>
				<Label className="font-sans">Hypercerts</Label>
				<HypercertField hypercerts={hypercerts} setHypercerts={setHypercerts} />
				{errors.hypercerts && (
					<div className="font-sans text-destructive text-sm">
						{errors.hypercerts}
					</div>
				)}
			</div>
			<Button
				type="submit"
				className="mt-4 h-12 w-full font-sans font-semibold text-lg"
			>
				Update collection
			</Button>
		</form>
	);
}
