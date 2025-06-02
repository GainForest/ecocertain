"use client";
import ecocertMappings from "./ecocert-mappings.json";

export type GitcoinDonationEntry = {
	amountInUsd: number;
	donor: string;
	transactionHash: string;
	timestamp: string;
};

export type GitcoinData = {
	gitcoinProjectid: string;
	ecocertId: string;
	creatorAddress: string;
	gitcoinApplicationId: string;
	donations: GitcoinDonationEntry[];
};
/*
  Test function to return some gitcoin ecocerts always:
*/

const generateTestGitcoinData = (hypercertIds: string[]): GitcoinData[] => {
	return hypercertIds.map((hc) => {
		return {
			gitcoinProjectid:
				"0x90c71978c9240bd6abc88730bdc865578b17295e933af7ed8fda6ae1416ed812",
			ecocertId: hc,
			creatorAddress: "0xf3ad97364bccc3ea0582ede58c363888f8c4ec85",
			gitcoinApplicationId: "5",
			donations: [
				{
					amountInUsd: 0.5,
					donor: "0x1eF170D53C54470FD0fd27619A54b42da6F4E0F4",
					transactionHash: "0x1234567890123456789012345678901234567890",
					timestamp: "2025-04-02 16:32:56+00:00",
				},
				{
					amountInUsd: 0.8,
					donor: "0x1eF170D53C54470FD0fd27619A54b42da6F4E0F4",
					transactionHash: "0x1234567890123456789012345678901234567890",
					timestamp: "2025-04-02 16:32:56+00:00",
				},
				{
					amountInUsd: 3.1417,
					donor: "0x60b979De2c961Ac884E6a5D921cDbfA0f454EAA4",
					transactionHash: "0x1234567890123456789012345678901234567890",
					timestamp: "2025-04-02 16:32:56+00:00",
				},
			],
		};
	});
};

const useGitcoinData = (userHypercertIds: string[]): (GitcoinData | null)[] => {
	// return generateTestGitcoinData(userHypercertIds);
	const gitcoinDataArray = userHypercertIds.map((hc) => {
		const gitcoinData = (ecocertMappings as GitcoinData[]).find(
			(m) => m.ecocertId === hc,
		);
		if (!gitcoinData) return null;
		return gitcoinData;
	});
	return gitcoinDataArray;
};

export default useGitcoinData;
