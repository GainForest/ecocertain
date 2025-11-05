"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import { useQuery } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { fetchHypercertById } from "../../graphql/hypercerts/queries/hypercerts";
import { catchError } from "../utils";

// Status type definition
type StatusType = {
	type: "loading" | "success" | "error";
	message: string;
};

const StatusBox = ({
	variant,
	text,
	cta,
}: {
	variant: "loading" | "error" | "success";
	text: React.ReactNode;
	cta?: React.ReactNode;
}) => {
	return (
		<div className="flex min-h-20 w-full flex-col items-center justify-center gap-2 rounded-lg bg-muted p-2 text-muted-foreground">
			{variant === "loading" && <Loader2 className="animate-spin" />}
			{variant === "error" && <CircleAlert size={28} className="opacity-50" />}
			{variant === "success" && (
				<CircleCheck size={28} className="opacity-50" />
			)}
			<span className="text-balance text-center">{text}</span>
			{cta}
		</div>
	);
};

const UnlistDialog = ({
	children,
	hypercertId,
}: {
	children: React.ReactNode;
	hypercertId: string;
}) => {
	const { address, isConnected } = useAccount();
	const { client: hcExchangeClient } = useHypercertExchangeClient();
	const {
		data: hypercert,
		isFetching: hypercertLoading,
		error: hypercertError,
		refetch: refetchHypercert,
	} = useQuery({
		queryKey: [`unlist-dialog-for-${hypercertId}`, hypercertId],
		queryFn: () => fetchHypercertById(hypercertId),
	});

	const [status, setStatus] = useState<StatusType>();

	const unlistHypercert = useCallback(async () => {
		console.log("unlistHypercert", hypercert);
		setStatus({ type: "loading", message: "Preparing to unlist..." });
		if (!hypercert)
			throw new Error("Error gathering information about the ecocert.");
		if (hypercert.orderNonce === undefined || !hypercert.orderId)
			throw new Error("This ecocert is not yet listed on marketplace.");
		if (!isConnected || !address)
			throw new Error("Please connect your wallet to authorize this action.");
		if (address.toLowerCase() !== hypercert.creatorAddress.toLowerCase())
			throw new Error("You are not authorized for this action.");
		if (!hcExchangeClient)
			throw new Error("Something went wrong. Please try again.");

		setStatus({
			type: "loading",
			message: "Please sign the transaction to unlist the ecocert.",
		});
		const [unlistTxError, unlistTx] = await catchError(
			hcExchangeClient.deleteOrder(hypercert.orderId),
		);
		if (unlistTxError) throw new Error("The transaction was rejected.");

		if (!unlistTx)
			throw new Error(
				"The ecocert could not be listed because transaction failed. Please try again.",
			);
	}, [hcExchangeClient, hypercert, isConnected, address]);

	const handleUnlist = async () => {
		if (status?.type === "loading") return;
		setStatus({ type: "loading", message: "Preparing to unlist..." });

		const [unlistError] = await catchError(unlistHypercert());
		if (unlistError) {
			setStatus({
				type: "error",
				message: unlistError.message,
			});
		} else {
			setStatus({
				type: "success",
				message:
					"The Ecocert has been unlisted successfully. This might take a few minutes to reflect.",
			});
		}
	};

	const resetDialog = () => {
		refetchHypercert();
		setStatus(undefined);
	};

	return (
		<Dialog
			onOpenChange={(open) => {
				if (open) resetDialog();
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="font-sans">
				<DialogHeader>
					<DialogTitle>Unlist Ecocert</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					Remove this Ecocert from the marketplace.
				</DialogDescription>

				{status ? (
					<StatusBox variant={status.type} text={status.message} />
				) : // before the unlisting process:
				hypercertLoading ? (
					<StatusBox variant="loading" text="Loading Ecocert info..." />
				) : hypercertError ? (
					<StatusBox
						variant="error"
						text="Unable to get ecocert info. Please retry."
					/>
				) : hypercert ? (
					isConnected &&
					address?.toLowerCase() === hypercert?.creatorAddress.toLowerCase() ? (
						hypercert.orderId && hypercert.orderNonce !== undefined ? (
							<div className="flex flex-col gap-2">
								<span>
									Are you sure to unlist the Ecocert,{" "}
									<b>{hypercert?.name ?? "Untitled"}</b> from the marketplace?
								</span>
								<span>
									Unlisting the ecocert will stop donations. You can create a
									new listing to start accepting donations again.
								</span>
							</div>
						) : (
							<StatusBox
								variant="error"
								text="This Ecocert is not yet listed on the marketplace."
							/>
						)
					) : (
						<StatusBox
							variant="error"
							text="You are not authorized to unlist this Ecocert. Please connect your wallet with an authorized account."
						/>
					)
				) : (
					<StatusBox
						variant="error"
						text="Something went wrong. Please retry."
					/>
				)}

				<DialogFooter>
					<DialogClose asChild>
						{status?.type !== "loading" && (
							<Button variant="outline">Cancel</Button>
						)}
					</DialogClose>
					{!hypercertLoading &&
						!hypercertError &&
						hypercert &&
						isConnected &&
						address?.toLowerCase() === hypercert.creatorAddress.toLowerCase() &&
						status?.type !== "success" && (
							<Button
								variant="secondary"
								onClick={handleUnlist}
								disabled={status?.type === "loading"}
							>
								{status === undefined
									? "Unlist"
									: status.type === "loading"
									  ? "Unlisting..."
									  : status.type === "error"
										  ? "Retry"
										  : null}
							</Button>
						)}
					{status?.type === "success" && (
						<DialogClose asChild>
							<Button>Close</Button>
						</DialogClose>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default UnlistDialog;
