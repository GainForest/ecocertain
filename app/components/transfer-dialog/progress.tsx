import { Button } from "@/components/ui/button";
import { useHypercertClient } from "@/hooks/use-hypercerts-client";
import {
	ArrowUpRight,
	Check,
	ChevronLeft,
	CircleAlert,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const Progress = ({
	values,
	back,
	onSuccess,
}: {
	values: {
		fractionId: string;
		recipientAddress: string;
	};
	back: () => void;
	onSuccess: () => void;
}) => {
	const [transferStatus, setTransferStatus] = useState<
		"loading" | "success" | "error"
	>("loading");
	const [label, setLabel] = useState<string>("Please wait...");
	const [txHash, setTxHash] = useState<string | null>(null);
	const { client: hypercertClient } = useHypercertClient();

	const { chain } = useAccount();

	const { fractionId, recipientAddress } = values;
	const tokenId = fractionId.split("-")[2];

	const handleTransfer = async () => {
		if (!hypercertClient) {
			setTransferStatus("error");
			setLabel("Please connect your wallet to transfer the fraction.");
			return;
		}
		try {
			setTransferStatus("loading");
			setLabel("Please sign the transaction and wait for it to complete...");
			const txHash = await hypercertClient.transferFraction({
				fractionId: BigInt(tokenId),
				to: recipientAddress as `0x${string}`,
			});
			setTransferStatus("success");
			setLabel("The transaction was successful.");
			setTxHash(txHash);
			onSuccess();
		} catch (error) {
			setTransferStatus("error");
			console.error(error);
			setLabel("The transaction was rejected or failed.");
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(transferStatus): transfer status is not a dependency
	useEffect(() => {
		if (transferStatus === "error") return;
		if (hypercertClient) {
			handleTransfer();
		}
	}, [hypercertClient, handleTransfer]);

	return (
		<div className="flex flex-col items-center justify-center rounded-xl bg-muted/50 p-2">
			<div className="flex w-full items-center">
				{transferStatus !== "loading" && (
					<Button variant={"ghost"} size="sm" className="gap-2" onClick={back}>
						<ChevronLeft size={14} />
						Back
					</Button>
				)}
			</div>
			<div className="flex flex-col items-center gap-2">
				{transferStatus === "loading" ? (
					<Loader2 className="animate-spin" size={24} />
				) : transferStatus === "success" ? (
					<Check className="text-green-500" size={32} />
				) : (
					<CircleAlert className="text-red-500" size={32} />
				)}
				<p className="text-sm">{label}</p>
				{txHash && chain && (
					<Link
						href={`${chain.blockExplorers?.default.url}/tx/${txHash}`}
						target="_blank"
					>
						<Button variant={"outline"} className="gap-2">
							View on block explorer <ArrowUpRight size={14} />
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
};

export default Progress;
