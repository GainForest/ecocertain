import { useMutation } from "@tanstack/react-query";
import { useHypercertClient } from "@/hooks/use-hypercerts-client";
import { usePublicClient, useWaitForTransactionReceipt } from "wagmi";

import {
	type HypercertMetadata,
	TransferRestrictions,
} from "@hypercerts-org/sdk";
import { parseEther, type TransactionReceipt } from "viem";
import { useEffect, useState } from "react";
import { constructHypercertIdFromReceipt } from "@/utils/constructHypercertIdFromReceipt";
import { useSendEmailAndUpdateGoogle } from "./use-send-email-and-update-google";

type Payload = {
	metaData: HypercertMetadata;
	contactInfo: string;
	amount: string;
};

const useMintHypercert = () => {
	const [contactInfo, setContactInfo] = useState<string>("");
	const [metaData, setMetaData] = useState<HypercertMetadata | undefined>();
	const { client } = useHypercertClient();
	const publicClient = usePublicClient();

	if (!client) {
		throw new Error("Hypercert Client is not initialized");
	}

	if (!publicClient) {
		throw new Error("Public client is not initialized");
	}

	const {
		mutate: mintHypercert,
		data: mintData,
		status: mintStatus,
		isIdle: isMintIdle,
		isPending: isMintPending,
		isSuccess: isMintSuccess,
		isError: isMintError,
		error: mintError,
	} = useMutation({
		mutationFn: (payload: Payload) => {
			const { metaData, contactInfo, amount } = payload;
			console.log("contactInfo", contactInfo);
			console.log("amount", amount);
			setContactInfo(contactInfo);
			return client.mintClaim(
				metaData,
				parseEther("1"),
				TransferRestrictions.FromCreatorOnly,
			);
		},
	});

	console.log("mintData", mintData);

	const {
		data: receiptData,
		isLoading: isReceiptLoading,
		isPending: isReceiptPending,
		isSuccess: isReceiptSuccess,
		isError: isReceiptError,
		error: receiptError,
	} = useWaitForTransactionReceipt({
		hash: mintData,
		query: {
			enabled: !!mintData,
			select: (data) => {
				const hypercertId = constructHypercertIdFromReceipt(
					data as TransactionReceipt,
					publicClient.chain.id,
				);
				return {
					...data,
					hypercertId,
				};
			},
			staleTime: Number.POSITIVE_INFINITY,
		},
	});

	// TODO: Update these values to better reflect the hook
	const {
		data: googleSheetsData,
		mutate: sendEmailAndUpdateGoogle,
		status: googleSheetsStatus,
		error: googleSheetsError,
	} = useSendEmailAndUpdateGoogle();

	useEffect(() => {
		if (receiptData?.hypercertId && contactInfo) {
			sendEmailAndUpdateGoogle({
				hypercertId: receiptData.hypercertId,
				contactInfo,
			});
		}
	}, [receiptData?.hypercertId, contactInfo, sendEmailAndUpdateGoogle]);

	return {
		mintHypercert,
		mintStatus,
		isMintIdle,
		isMintPending,
		isMintSuccess,
		isMintError,
		mintData,
		mintError,
		receiptData,
		receiptError,
		isReceiptPending,
		isReceiptLoading,
		isReceiptSuccess,
		isReceiptError,
		googleSheetsData,
		googleSheetsStatus,
		googleSheetsError,
		metaData,
		setMetaData,
	};
};

export default useMintHypercert;
