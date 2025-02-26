"use client";
import type { FullHypercert } from "@/app/graphql-queries/hypercerts";
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
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useAccount } from "wagmi";
import useFullHypercert from "../../contexts/full-hypercert";
import usePaymentFlowDialog from "./hooks/usePaymentFlowDialog";

const PaymentFlowDialog = ({ children }: { children: React.ReactNode }) => {
	const hypercert = useFullHypercert();
	const { address } = useAccount();

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
								Close
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
					{transactionReceipt && transactionReceipt.status === 1 && address && (
						<Link href={`/profile/${address}`}>
							<Button>
								<span>View supported hypercerts</span>
								<ArrowRight size={16} />
							</Button>
						</Link>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const PaymentFlow = ({ children }: { children: React.ReactNode }) => {
	return <PaymentFlowDialog>{children}</PaymentFlowDialog>;
};

export default PaymentFlow;
