"use client";
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

import type React from "react";
import { useEffect, useState } from "react";

import {
	type FullHypercert,
	fetchFullHypercertById,
} from "@/app/graphql-queries/hypercerts";
import type { ApiError } from "@/app/utils/graphql";
import ListingProgress from "./listing-progress";

import { Button } from "@/components/ui/button";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import type { SUPPORTED_CURRENCIES } from "@hypercerts-org/marketplace-sdk";
import { CircleAlert, Loader2, RefreshCcw, RefreshCw } from "lucide-react";
import PriceForm from "./price-form";
import Sidebar from "./sidebar";

const CreateListingDialog = ({
	hypercertId,
	trigger,
}: {
	hypercertId: string;
	trigger: React.ReactNode;
}) => {
	const { client: hcExchangeClient } = useHypercertExchangeClient();

	const [hypercert, setHypercert] = useState<FullHypercert>();
	const [hypercertFetchError, setHypercertFetchError] = useState<ApiError>();
	const [retry, setRetry] = useState(0);
	const [isProgressVisible, setIsProgressVisible] = useState(false);

	const [price, setPrice] = useState(1);
	const [priceValidityError, setPriceValidityError] = useState<string | null>(
		null,
	);
	const [selectedCurrency, setSelectedCurrency] =
		useState<(typeof SUPPORTED_CURRENCIES)[number]>("ETH");

	// biome-ignore lint/correctness/useExhaustiveDependencies(hypercertId): retry should be the only trigger for the side effect
	// biome-ignore lint/correctness/useExhaustiveDependencies(retry): retry should be the only trigger for the side effect
	useEffect(() => {
		setHypercert(undefined);
		setHypercertFetchError(undefined);
		fetchFullHypercertById(hypercertId)
			.then((hypercert) => {
				setHypercert(hypercert);
			})
			.catch((error) => {
				setHypercertFetchError(error);
			});
	}, [retry]);

	const shouldDisplayForm =
		hypercert &&
		!hypercertFetchError &&
		hypercert.orders.length === 0 &&
		!isProgressVisible;

	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent sidebarChildren={<Sidebar />}>
				<DialogHeader>
					<DialogTitle className="font-baskerville">
						List ecocert for sale
					</DialogTitle>
					<DialogDescription className="font-sans text-base">
						List your ecocert for sale on the marketplace and get donations.
					</DialogDescription>
				</DialogHeader>
				<div className="flex w-full flex-1 flex-col">
					{hypercertFetchError ? (
						<div className="flex flex-col items-center justify-center">
							<CircleAlert size={36} className="text-destructive opacity-50" />
							<span className="font-bold font-sans text-lg">
								Unable to load information
							</span>
							<p className="mt-1 text-balance text-center text-muted-foreground text-sm">
								We could not load information about this ecocert.
							</p>
							<Button
								onClick={() => setRetry(retry + 1)}
								size={"sm"}
								className="mt-3 gap-2"
							>
								<RefreshCw size={16} />
								Retry
							</Button>
						</div>
					) : hypercert ? (
						hypercert.orders.length > 0 ? (
							<div className="flex flex-col gap-2">
								<p className="text-destructive">Already listed</p>
								<p className="text-destructive">
									This ecocert is already listed.
								</p>
							</div>
						) : !isProgressVisible ? (
							<PriceForm
								priceState={[price, setPrice]}
								priceValidityErrorState={[
									priceValidityError,
									setPriceValidityError,
								]}
								currencyState={[selectedCurrency, setSelectedCurrency]}
							/>
						) : (
							<ListingProgress
								values={{
									price,
									currency: selectedCurrency,
								}}
								hypercert={hypercert}
								visible={isProgressVisible}
								setVisible={setIsProgressVisible}
								hypercertExchangeClient={hcExchangeClient}
							/>
						)
					) : (
						<div className="flex h-40 flex-col items-center justify-center">
							<Loader2 className="animate-spin text-primary" size={28} />
							<span className="mt-2 text-balance text-center font-sans text-muted-foreground text-sm">
								Please wait while we gather information...
							</span>
						</div>
					)}
				</div>
				<DialogFooter>
					<DialogCancel>Cancel</DialogCancel>
					{shouldDisplayForm ? (
						<Button
							disabled={priceValidityError !== null}
							onClick={() => {
								setIsProgressVisible(true);
							}}
						>
							Next
						</Button>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateListingDialog;
