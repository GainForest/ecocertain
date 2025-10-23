"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import {
	ModalContent,
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal/modal";
import { ChevronLeft } from "lucide-react";

function SwapperSkeleton() {
	return (
		<div
			className="h-[382px] w-[340px] min-w-[340px] max-w-[340px] animate-pulse rounded-2xl border bg-muted/30 p-4 shadow-md"
			aria-hidden="true"
		>
			<div className="space-y-3">
				<div className="h-8 rounded-md bg-muted" />
				<div className="h-10 rounded-md bg-muted" />
			</div>

			<div className="mt-4 space-y-2">
				<div className="h-4 w-3/5 rounded bg-muted" />
				<div className="h-4 w-2/5 rounded bg-muted" />
			</div>

			<div className="my-4 h-px bg-border" />

			<div className="space-y-3">
				<div className="h-10 rounded-md bg-muted" />
				<div className="h-10 rounded-md bg-muted" />
				<div className="h-10 rounded-md bg-muted" />
			</div>

			<div className="mt-6 h-10 w-full rounded-md bg-muted" />
		</div>
	);
}

export default function WidgetSkeleton() {
	const { popModal } = useModal();

	return (
		<ModalContent dismissible={false} className="font-sans">
			<ModalHeader className="flex items-center gap-4">
				<Button
					variant={"secondary"}
					size={"sm"}
					className="h-6 w-6 rounded-full p-0.5"
					onClick={() => popModal()}
				>
					<ChevronLeft />
				</Button>
				<div>
					<ModalTitle>Swap Tokens</ModalTitle>
					<ModalDescription>
						Swap your tokens into the ecocert currency.
					</ModalDescription>
				</div>
			</ModalHeader>
			<div className="mt-4 flex justify-center">
				<SwapperSkeleton />
			</div>
		</ModalContent>
	);
}
