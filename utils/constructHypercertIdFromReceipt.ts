import { debugLog } from "@/utils/debugLog";
import type { BigNumber } from "@ethersproject/bignumber";
import { HypercertMinterAbi } from "@hypercerts-org/contracts";
import { type TransactionReceipt, decodeEventLog, getAddress } from "viem";

export const constructHypercertIdFromReceipt = (
	receipt: TransactionReceipt,
	chainId: number,
) => {
	if (!receipt || !receipt.logs) {
		console.log("No receipt found");
		return;
	}
	debugLog(receipt);
	const events = receipt.logs.map((log) =>
		decodeEventLog({
			abi: HypercertMinterAbi,
			data: log.data,
			topics: log.topics,
		}),
	);

	debugLog("events", events);
	if (!events) {
		throw new Error("No events in receipt");
	}

	const claimEvent = events.find((e) => e.eventName === "ClaimStored");

	if (!claimEvent) {
		throw new Error("ClaimStored event not found");
	}

	const { args } = claimEvent;

	if (!args) {
		throw new Error("No args in event");
	}

	// @ts-ignore
	// biome-ignore lint/complexity/useLiteralKeys: <explanation>
	const tokenIdBigNumber = args["claimID"] as BigNumber;

	if (!tokenIdBigNumber) {
		throw new Error("No tokenId arg in event");
	}

	const contractAddress = receipt.to;
	if (contractAddress === null) return "";
	const formattedContractAddress = getAddress(contractAddress);
	const tokenId = tokenIdBigNumber.toString();

	return `${chainId}-${formattedContractAddress}-${tokenId}`;
};
