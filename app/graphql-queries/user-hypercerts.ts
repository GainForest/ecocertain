import { typeCastApiResponseToBigInt } from "@/lib/utils";
import { type ResultOf, graphql } from "gql.tada";
import { catchError } from "../utils";
import {
	type ApiError,
	fetchHypercertsGraphQL as fetchGraphQL,
} from "../utils/graphql";
import type { Hypercert } from "./hypercerts";
import { hypercert } from "./templates";

const hypercertsByUserIdQuery = graphql(`
    query GetHypercertsByUserId($address: String!) {
      hypercerts(
        where: { creator_address: { contains: $address } }
        sort: { by: { attestations_count: descending } }
      ) {
        count
        ${hypercert}
      }
    }
  `);

type HypercertsByUserIdResponse = ResultOf<typeof hypercertsByUserIdQuery>;

export type UserHypercerts = {
	count: number;
	hypercerts: Hypercert[];
};

export const fetchHypercertsByUserId = async (
	address: string,
): Promise<UserHypercerts> => {
	const [error, response] = await catchError<
		HypercertsByUserIdResponse,
		ApiError
	>(
		fetchGraphQL(hypercertsByUserIdQuery, {
			address,
		}),
	);
	if (error) {
		throw error;
	}

	const hypercerts = response.hypercerts.data;
	if (!hypercerts)
		throw {
			message: "Hypercerts not found",
			type: "PAYLOAD",
		};

	const hypercertsData = hypercerts.map((hypercert) => {
		const pricePerPercentInUSD =
			hypercert.orders?.cheapestOrder?.pricePerPercentInUSD;
		const pricePerPercentInUSDNumber = pricePerPercentInUSD
			? Number(pricePerPercentInUSD)
			: undefined;

		// Get unique buyers count
		const uniqueBuyers = new Set(
			hypercert.sales?.data?.map((sale) => sale.buyer as string) ?? [],
		);

		return {
			hypercertId: hypercert.hypercert_id as string,
			creatorAddress: hypercert.creator_address as string,
			chainId: (hypercert.contract?.chain_id as string) ?? undefined,
			name: hypercert.metadata?.name ?? undefined,
			description: hypercert.metadata?.description ?? undefined,
			totalUnits: typeCastApiResponseToBigInt(hypercert.units) ?? 0n,
			unitsForSale: typeCastApiResponseToBigInt(
				hypercert.orders?.totalUnitsForSale as string,
			),
			pricePerPercentInUSD: pricePerPercentInUSDNumber,
			buyerCount: uniqueBuyers.size,
		} satisfies Hypercert;
	});

	return {
		hypercerts: hypercertsData,
		count: hypercertsData.length ?? 0,
	};
};
