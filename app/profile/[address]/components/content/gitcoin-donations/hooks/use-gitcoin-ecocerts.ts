"use client";

import { fetchFractionsByHypercert } from "@/graphql/hypercerts/queries/fractions-by-hypercert";
import { useQuery } from "@tanstack/react-query";
import type { GitcoinData } from "./use-gitcoin-data";

export const useGitcoinEcocerts = (gitcoinDataArray: GitcoinData[]) => {
	const gitcoinEcocertIds = gitcoinDataArray.map((data) => data.ecocertId);
	const {
		data: gitcoinEcocertFractions,
		isPending,
		isRefetching,
		isFetching,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["gitcoin-ecocert-fractions", gitcoinEcocertIds],
		queryFn: async () => {
			const fractions = await Promise.all(
				gitcoinEcocertIds.map((ecocertId) => {
					return fetchFractionsByHypercert(ecocertId);
				}),
			);
			return gitcoinEcocertIds.map((ecocertId, index) => {
				return {
					ecocertId,
					ownerFractions: fractions[index],
				};
			});
		},
	});

	const data = gitcoinEcocertFractions
		? gitcoinEcocertFractions
				.map((fraction) => {
					const gitcoinData = gitcoinDataArray.find(
						(data) => data.ecocertId === fraction.ecocertId,
					);
					if (!gitcoinData) {
						return null;
					}
					return {
						...gitcoinData,
						ownerFractions: fraction.ownerFractions,
					};
				})
				.filter((ecocert) => ecocert !== null)
		: undefined;

	return {
		data,
		isPending,
		isRefetching,
		isFetching,
		isLoading,
		error,
		refetch,
	};
};
