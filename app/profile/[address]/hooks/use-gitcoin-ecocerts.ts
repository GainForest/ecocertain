import ecocertMappings from "@/graphql/gitcoin/queries/round-35/ecocert-mappings.json";
import {
	type GitcoinEcocert,
	fetchMultipleGitcoinEcocerts,
} from "@/graphql/gitcoin/queries/round-35/gitcoin-ecocert";
import { fetchFractionsByHypercert } from "@/graphql/hypercerts/queries/fractions-by-hypercert";
import { useQuery } from "@tanstack/react-query";

/*
  Test function to return some gitcoin ecocerts always:
*/

const testFetchGitcoinEcocerts = async (
	userHypercertIds: string[],
): Promise<(GitcoinEcocert | null)[]> => {
	const fractionPromises = userHypercertIds.map((id) =>
		fetchFractionsByHypercert(id),
	);
	const fractions = await Promise.all(fractionPromises);
	return fractions.map((f, index) => {
		if (!f) return null;
		return {
			applicationId: `${index}`,
			ecocertId: userHypercertIds[index],
			donations: [
				{
					amount: "100",
					amountInRoundMatchToken: "100",
					amountInUsd: "0.5",
					donorAddress: "0x1eF170D53C54470FD0fd27619A54b42da6F4E0F4",
					donationId: "1",
					donationType: "gitcoin",
					tokenAddress: "0x123",
					transactionHash: "0x123",
				},
				{
					amount: "100",
					amountInRoundMatchToken: "100",
					amountInUsd: "0.8",
					donorAddress: "0x60b979De2c961Ac884E6a5D921cDbfA0f454EAA4",
					donationId: "1",
					donationType: "gitcoin",
					tokenAddress: "0x123",
					transactionHash: "0x123",
				},
				{
					amount: "100",
					amountInRoundMatchToken: "100",
					amountInUsd: "3.1417",
					donorAddress: "0x60b979De2c961Ac884E6a5D921cDbfA0f454EAA4",
					donationId: "1",
					donationType: "gitcoin",
					tokenAddress: "0x123",
					transactionHash: "0x123",
				},
			],
			ownerFractions: f,
		};
	});
};

const useGitcoinEcocerts = (userHypercertIds: string[], key?: string) => {
	const {
		data: gitcoinEcocerts,
		isLoading: isGitcoinEcocertsLoading,
		refetch: refetchGitcoinEcocerts,
		isRefetching: isRefetchingGitcoinEcocerts,
	} = useQuery({
		queryKey: ["gitcoin-ecocerts", userHypercertIds, key ?? "default"],
		queryFn: async () => {
			// return await testFetchGitcoinEcocerts(userHypercertIds);
			const gitcoinApplicationIds = userHypercertIds
				.map((id) => {
					const gitcoinProject = ecocertMappings.find(
						(mapping) => mapping.ecocertId === id,
					);
					return gitcoinProject?.gitcoinApplicationId;
				})
				.filter((id) => id !== undefined);
			const donations = await fetchMultipleGitcoinEcocerts(
				gitcoinApplicationIds,
			);
			return donations;
		},
		enabled: true,
	});

	return {
		gitcoinEcocerts,
		isGitcoinEcocertsLoading,
		isRefetchingGitcoinEcocerts,
		refetchGitcoinEcocerts,
	};
};

export default useGitcoinEcocerts;
