import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { HypercertMintReceiptData } from "@/hooks/use-mint-hypercert";
import { type HypercertMetadata, MintingError } from "@hypercerts-org/sdk";
import type { MutationStatus } from "@tanstack/query-core";
import {
	ArrowRight,
	ArrowUpRight,
	Badge,
	BadgeCheck,
	BadgeX,
	Loader,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Address, WaitForTransactionReceiptErrorType } from "viem";
import type { WaitForTransactionReceiptData } from "wagmi/query";

const HypercertMintDialog = ({
	mintStatus,
	mintError,
	isReceiptLoading,
	isReceiptSuccess,
	isReceiptError,
	receiptError,
	googleSheetsStatus,
	googleSheetsError,
	receiptData,
	setOpenMintDialog,
}: {
	mintStatus: MutationStatus;
	mintData?: Address;
	mintError: Error | null;
	isReceiptLoading: boolean;
	isReceiptSuccess: boolean;
	isReceiptError: boolean;
	googleSheetsStatus: MutationStatus;
	googleSheetsError: Error | null;
	receiptError: WaitForTransactionReceiptErrorType | null;
	receiptData?: HypercertMintReceiptData;
	setOpenMintDialog: Dispatch<SetStateAction<boolean>>;
}) => {
	const handleCloseDialog = () => {
		setOpenMintDialog(false);
	};

	return (
		<div>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Minting Hypercert</DialogTitle>
					<DialogDescription>
						This will show the status of the minting process.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-start gap-2">
						{mintStatus === "idle" && (
							<>
								<Badge className="h-5 w-5" />
								<p>Preparing to mint hypercert</p>
							</>
						)}
						{mintStatus === "pending" && (
							<>
								<Loader className="h-5 w-5 animate-spin" />
								<p>Minting hypercert on chain</p>
							</>
						)}
						{mintStatus === "success" && (
							<>
								<BadgeCheck className="h-5 w-5" />
								<p className="">Transaction processed</p>
							</>
						)}
						{mintStatus === "error" && mintError && (
							<>
								<BadgeX className="h-5 w-5" />
								<p className="">
									Minting Error:{" "}
									{mintError.message
										? mintError.message
										: "Error minting Hypercert. Please try again."}
								</p>
							</>
						)}
					</div>
					<div className="flex items-center justify-start gap-2">
						{!isReceiptSuccess && !isReceiptLoading && !isReceiptError && (
							<>
								<Badge className="h-5 w-5" />
								<p>Waiting for transaction to process</p>
							</>
						)}
						{isReceiptLoading && (
							<>
								<Loader className="h-5 w-5 animate-spin" />
								<p>Waiting for transaction receipt</p>
							</>
						)}
						{isReceiptSuccess && (
							<>
								<BadgeCheck className="h-5 w-5" />
								<p className="">Hypercert minted successfully!</p>
							</>
						)}
						{isReceiptError && receiptError && (
							<>
								<BadgeX className="h-5 w-5" />
								<p className="">
									Minting Error:{" "}
									{receiptError.message
										? receiptError.message
										: "Error processing transaction. Please try again."}
								</p>
							</>
						)}
					</div>
					<div className="flex items-center justify-start gap-2">
						{googleSheetsStatus === "idle" && (
							<>
								<Badge className="h-5 w-5" />
								<p>Waiting to send to GainForest.Earth for approval</p>
							</>
						)}
						{googleSheetsStatus === "pending" && (
							<>
								<Loader className="h-5 w-5 animate-spin" />
								<p>Sending to GainForest.Earth team</p>
							</>
						)}
						{googleSheetsStatus === "success" && (
							<>
								<BadgeCheck className="h-5 w-5" />
								<p className="">Sent to GainForest.Earth team!</p>
							</>
						)}
						{googleSheetsStatus === "error" && googleSheetsError && (
							<>
								<BadgeX className="h-5 w-5" />
								<p className="">
									Upload for approval error:{" "}
									{googleSheetsError.message
										? googleSheetsError.message
										: "Error processing transaction. Please try again."}
								</p>
							</>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant={"secondary"}
						onClick={handleCloseDialog}
					>
						Close
					</Button>
					{isReceiptSuccess && receiptData && (
						<Link href={`/hypercert/${receiptData.hypercertId}`}>
							<Button type="button" className="gap-2">
								<span>View hypercert</span>
								<ArrowRight size={16} />
							</Button>
						</Link>
					)}
				</DialogFooter>
			</DialogContent>
		</div>
	);
};

export { HypercertMintDialog };
