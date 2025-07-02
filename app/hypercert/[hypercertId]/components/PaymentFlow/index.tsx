"use client";
import useFullHypercert from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogCancel,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/modern-dialog-extended";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import Image from "next/image";
import type React from "react";
import usePaymentFlowDialog from "./hooks/usePaymentFlowDialog";

const PaymentFlowDialog = ({ children }: { children: React.ReactNode }) => {
	const hypercert = useFullHypercert();

	const {
		title,
		description,
		content,
		nextButton,
		setVariant,
		transactionReceipt,
	} = usePaymentFlowDialog(hypercert);
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				sidebarClassName="flex flex-col items-center justify-center"
				sidebarChildren={
					<>
						<Image
							src="/hero-images/HeroCover5.webp"
							alt="gainforest support"
							className="object-cover object-center"
							fill
						/>
						<div className="absolute right-0 bottom-0 left-0 flex h-32 flex-col items-center justify-end bg-gradient-to-t from-beige via-beige to-beige/0 pb-4">
							<Image
								src="/assets/media/images/logo.svg"
								alt="gainforest"
								height={36}
								width={36}
								className="brightness-90 drop-shadow-md"
							/>
							<span className="font-baskerville font-bold text-2xl">
								Support
							</span>
						</div>
					</>
				}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-1">
						<span>{title}</span>
					</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="flex-1">{content}</div>
				<DialogFooter>
					<DialogCancel asChild>
						{transactionReceipt ? (
							<Button
								variant={"secondary"}
								onClick={() => {
									setVariant?.("amount-options");
								}}
							>
								Finish
							</Button>
						) : (
							<Button
								variant={"secondary"}
								onClick={() => {
									setVariant?.("amount-options");
								}}
							>
								Cancel
							</Button>
						)}
					</DialogCancel>
					{nextButton}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const PaymentFlow = ({ children }: { children: React.ReactNode }) => {
	return <PaymentFlowDialog>{children}</PaymentFlowDialog>;
};

export default PaymentFlow;
