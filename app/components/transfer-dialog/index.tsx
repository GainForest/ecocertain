import { fetchFractionsByHypercert } from "@/app/graphql-queries/fractions-by-hypercert";
import { fetchHypercertById } from "@/app/graphql-queries/hypercerts";
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
import { gainforestMultisigForTransfers } from "@/config/gainforest";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { ErrorBox } from "./error-box";
import Form from "./form";
import Progress from "./progress";
import Sidebar from "./sidebar";

const GetVerifiedDialog = ({
	hypercertId,
	trigger,
}: {
	hypercertId: string;
	trigger: React.ReactNode;
}) => {
	const { isConnected, address } = useAccount();
	const [recipientAddress, setRecipientAddress] = useState<string>(
		gainforestMultisigForTransfers,
	);
	const isValidRecipientAddress = useMemo(() => {
		return isAddress(recipientAddress);
	}, [recipientAddress]);
	const [isTransferring, setIsTransferring] = useState(false);
	const [isTransferSuccess, setIsTransferSuccess] = useState(false);

	const {
		data: hypercert,
		isPending: hypercertPending,
		isError: hypercertError,
		isRefetching: hypercertRefetching,
		refetch: hypercertRefetch,
	} = useQuery({
		queryKey: ["hypercert", hypercertId],
		queryFn: () => fetchHypercertById(hypercertId),
	});

	const {
		data: fractions,
		isPending: fractionsPending,
		isError: fractionsError,
		isRefetching: fractionsRefetching,
		refetch: fractionsRefetch,
	} = useQuery({
		queryKey: ["fractions", hypercertId],
		queryFn: () => fetchFractionsByHypercert(hypercertId),
	});

	const [selectedFractionId, setSelectedFractionId] = useState<
		string | undefined
	>(undefined);

	useEffect(() => {
		if (!fractions) {
			setSelectedFractionId(undefined);
		} else if (fractions.length > 0) {
			if (selectedFractionId === undefined) {
				setSelectedFractionId(fractions[0].fractionId);
			} else if (
				!fractions.find(
					(fraction) => fraction.fractionId === selectedFractionId,
				)
			) {
				setSelectedFractionId(fractions[0].fractionId);
			}
		}
	}, [fractions, selectedFractionId]);

	const handleDialogOpenChange = (open: boolean) => {
		if (open) {
			hypercertRefetch();
			fractionsRefetch();
			setIsTransferSuccess(false);
		}
	};

	const isSomethingLoading =
		hypercertPending ||
		hypercertRefetching ||
		fractionsPending ||
		fractionsRefetching;

	const isSomeError = hypercertError || fractionsError;
	const isCreator =
		!hypercert || !address
			? undefined
			: hypercert.creatorAddress.toLowerCase() === address.toLowerCase();
	const hasFractions = fractions ? fractions.length > 0 : undefined;

	return (
		<Dialog onOpenChange={handleDialogOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent sidebarChildren={<Sidebar />} className="font-sans">
				<DialogHeader>
					<DialogTitle>Transfer Ecocert</DialogTitle>
					<DialogDescription>
						Transfer a fraction of your ecocert to an address
					</DialogDescription>
				</DialogHeader>
				<div>
					{(!isConnected || !address) && (
						<ErrorBox message="Please connect your wallet first." />
					)}
					{isConnected && address && (
						<>
							{isTransferring ? (
								<Progress
									values={{
										fractionId: selectedFractionId ?? "",
										recipientAddress,
									}}
									back={() => setIsTransferring(false)}
									onSuccess={() => setIsTransferring(false)}
								/>
							) : isSomethingLoading ||
							  isCreator === undefined ||
							  hasFractions === undefined ? (
								// <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-muted p-4 text-center">
								//   <span className="font-bold text-lg">Loading...</span>
								// </div>
								<div className="flex flex-col gap-2">
									<div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
									<div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
									<div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
									<div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
								</div>
							) : isSomeError ? (
								<ErrorBox message="Error loading ecocert info." />
							) : !isCreator ? (
								<ErrorBox message="You are not the owner of this ecocert." />
							) : !hasFractions ? (
								<ErrorBox message="You don't own any fractions of this ecocert." />
							) : (
								<Form
									hypercert={hypercert}
									fractions={fractions ?? []}
									selectedFractionId={selectedFractionId ?? undefined}
									setSelectedFractionId={setSelectedFractionId}
									recipientAddress={recipientAddress}
									setRecipientAddress={setRecipientAddress}
								/>
							)}
						</>
					)}
				</div>
				<DialogFooter>
					{!isTransferring && <DialogCancel>Cancel</DialogCancel>}
					{isTransferSuccess && <DialogCancel>Close</DialogCancel>}
					{!isSomethingLoading && !isSomeError && !isTransferring && (
						<Button
							disabled={
								!isCreator ||
								!hasFractions ||
								!selectedFractionId ||
								!isValidRecipientAddress
							}
							onClick={() => setIsTransferring(true)}
						>
							Transfer
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default GetVerifiedDialog;
