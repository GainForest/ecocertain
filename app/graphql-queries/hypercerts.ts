import { hyperboardId } from "@/config/hypercerts";
import { typeCastApiResponseToBigInt } from "@/lib/utils";
import type { ApiError } from "@/types/api";
import { type ResultOf, graphql } from "gql.tada";
import { catchError } from "../utils";
import { fetchHypercertsGraphQL as fetchGraphQL } from "../utils/graphql";
import { hypercert } from "./templates";

const hypercertIdsByHyperboardIdQuery = graphql(`
  query GetHypercertIdsByHyperboardId($hyperboard_id: UUID!) {
    hyperboards(where: { id: { eq: $hyperboard_id } }) {
      data {
        sections {
          data {
            entries {
              id
            }
          }
        }
      }
    }
  }
`);
type HypercertIdsByHyperboardIdResponse = ResultOf<
	typeof hypercertIdsByHyperboardIdQuery
>;

export const fetchHypercertIDs = async () => {
	const [error, response] = await catchError<
		HypercertIdsByHyperboardIdResponse,
		ApiError
	>(
		fetchGraphQL(hypercertIdsByHyperboardIdQuery, {
			hyperboard_id: hyperboardId,
		}),
	);
	if (error) {
		throw error;
	}
	const hyperboards = response.hyperboards.data;
	if (!hyperboards)
		throw {
			message: "Hyperboard not found",
			type: "PAYLOAD",
		};
	const ids: string[] = [];
	for (const hyperboard of hyperboards) {
		for (const section of hyperboard.sections.data) {
			for (const entry of section.entries) {
				ids.push(entry.id);
			}
		}
	}

	return ids;
};

const hypercertByHypercertIdQuery = graphql(`
  query GetHypercertsByHypercertId($hypercert_id: String!) {
    hypercerts(where: { hypercert_id: { eq: $hypercert_id } }) {
      ${hypercert}
    }
  }
`);
type HypercertByHypercertIdQueryResponse = ResultOf<
	typeof hypercertByHypercertIdQuery
>;

export type Hypercert = {
	hypercertId: string;
	creatorAddress: string;
	chainId?: string;
	name?: string;
	description?: string;
	totalUnits: bigint;
	unitsForSale?: bigint;
	pricePerPercentInUSD?: number;
	buyerCount: number;
};

const fetchHypercertById = async (hypercertId: string): Promise<Hypercert> => {
	const [error, response] = await catchError<
		HypercertByHypercertIdQueryResponse,
		ApiError
	>(
		fetchGraphQL(hypercertByHypercertIdQuery, {
			hypercert_id: hypercertId,
		}),
	);
	if (error) {
		throw error;
	}

	const hypercert = response.hypercerts.data
		? response.hypercerts.data[0]
		: null;
	if (!hypercert)
		throw {
			message: "Hypercert not found",
			type: "PAYLOAD",
		};

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
		hypercertId,
		creatorAddress: hypercert.creator_address as string,
		chainId: (hypercert.contract?.chain_id as string) ?? undefined,
		name: hypercert.metadata?.name ?? undefined,
		description: hypercert.metadata?.description ?? undefined,
		totalUnits: typeCastApiResponseToBigInt(hypercert.units) ?? 0n,
		unitsForSale: typeCastApiResponseToBigInt(
			hypercert.orders?.totalUnitsForSale,
		),
		pricePerPercentInUSD: pricePerPercentInUSDNumber,
		buyerCount: uniqueBuyers.size,
	};
};

export const fetchHypercerts = async () => {
	const [hypercertIdFetchError, hypercertIds] = await catchError<
		string[],
		ApiError
	>(fetchHypercertIDs());
	if (hypercertIdFetchError) throw hypercertIdFetchError;

	const hypercertPromises = hypercertIds.map((hypercertId) =>
		fetchHypercertById(hypercertId),
	);
	const [error, hypercerts] = await catchError<Hypercert[], ApiError>(
		Promise.all(hypercertPromises),
	);
	console.log(error);

	if (error) throw error;
	return hypercerts;
};

const fullHypercertByHypercertIdQuery = graphql(`
  query GetFullHypercertsByHypercertId($hypercert_id: String!) {
    hypercerts(where: { hypercert_id: { eq: $hypercert_id } }) {
      data {
        units
        uri
        creation_block_timestamp
        creator_address
        contract {
          chain_id
        }
        metadata {
          name
          description
          work_scope
          work_timeframe_from
          work_timeframe_to
          contributors
        }
        orders {
          totalUnitsForSale
          cheapestOrder {
            price
            pricePerPercentInToken
            pricePerPercentInUSD
            currency
          }
          data {
            id
            price
            chainId
            pricePerPercentInToken
            pricePerPercentInUSD
            currency
          }
        }
        attestations {
          data {
            attester
            creation_block_timestamp
            data
            id
          }
        }
        sales {
          data {
            amounts
            buyer
            currency
            currency_amount
            creation_block_timestamp
            transaction_hash
          }
        }
      }
    }
  }
`);
type FullHypercertByHypercertIdQueryResponse = ResultOf<
	typeof fullHypercertByHypercertIdQuery
>;

export type FullHypercert = {
	hypercertId: string;

	saleStatus: "coming" | "open" | "sold";
	totalUnits: bigint;
	unitsForSale: bigint;
	uri?: string;
	creationBlockTimestamp: bigint;
	creatorAddress: string;
	chainId?: string;

	metadata: {
		name?: string;
		description?: string;
		work: {
			scope: string[];
			from?: bigint;
			to?: bigint;
		};
		contributors: string[];
	};

	cheapestOrder: {
		pricePerPercentInUSD?: number;
	};
	orders: {
		id: string;
		price: bigint;
		chainId: string;
		pricePerPercentInToken: number;
		pricePerPercentInUSD: number;
		currency: string;
	}[];
	attestations: {
		attester: string;
		creationBlockTimestamp: bigint;
		data: string;
		id: string;
		easSchema?: {
			id: string;
			schema: string;
		};
	}[];
	sales: {
		unitsBought: bigint;
		buyer: string;
		currency: string;
		currencyAmount: bigint;
		creationBlockTimestamp: bigint;
		transactionHash: string;
	}[];
};

export const fetchFullHypercertById = async (
	hypercertId: string,
	testingLog?: string,
): Promise<FullHypercert> => {
	if (testingLog) {
		console.log("calling from fetchFullHypercertById", testingLog);
	}
	const [error, response] = await catchError<
		FullHypercertByHypercertIdQueryResponse,
		ApiError
	>(
		fetchGraphQL(
			fullHypercertByHypercertIdQuery,
			{
				hypercert_id: hypercertId,
			},
			testingLog,
		),
	);
	if (error) {
		throw error;
	}

	const hypercert = response.hypercerts.data
		? response.hypercerts.data[0]
		: null;
	if (!hypercert)
		throw {
			message: "Hypercert not found",
			type: "PAYLOAD",
		};

	const cheapestOrder = hypercert.orders?.cheapestOrder;
	const unitsForSale =
		typeCastApiResponseToBigInt(hypercert.orders?.totalUnitsForSale) ?? 0n;

	let saleStatus: "coming" | "open" | "sold" = "open";
	if (!cheapestOrder) {
		if (unitsForSale === 0n) {
			saleStatus = "sold";
		} else {
			saleStatus = "coming";
		}
	}

	const metadata = hypercert.metadata;
	const pricePerPercentInUSD = cheapestOrder?.pricePerPercentInUSD
		? Number(cheapestOrder?.pricePerPercentInUSD)
		: undefined;

	const orders = hypercert.orders?.data ?? [];
	const parsedOrders = orders.map((order) => {
		return {
			id: order.id as string,
			price: typeCastApiResponseToBigInt(order.price) ?? 0n,
			pricePerPercentInToken: Number(order.pricePerPercentInToken),
			pricePerPercentInUSD: Number(order.pricePerPercentInUSD),
			currency: order.currency.toLowerCase() as string,
			chainId: order.chainId as string,
		};
	});

	const sales = hypercert.sales?.data ?? [];
	const parsedSales = sales.map((sale) => {
		return {
			unitsBought: typeCastApiResponseToBigInt(sale.amounts?.[0] ?? 0) ?? 0n,
			buyer: sale.buyer.toLowerCase(),
			currency: sale.currency.toLowerCase(),
			currencyAmount:
				typeCastApiResponseToBigInt(sale.currency_amount ?? 0) ?? 0n,
			creationBlockTimestamp:
				typeCastApiResponseToBigInt(sale.creation_block_timestamp) ?? 0n,
			transactionHash: sale.transaction_hash,
		};
	});

	const attestations = hypercert.attestations?.data ?? [];
	const parsedAttestations = attestations
		.map((attestation) => {
			if (!attestation.attester) return null;
			return {
				attester: attestation.attester.toLowerCase(),
				creationBlockTimestamp:
					typeCastApiResponseToBigInt(attestation.creation_block_timestamp) ??
					0n,
				data: attestation.data as string,
				id: attestation.id,
			};
		})
		.filter((attestation) => attestation !== null);

	const fullHypercert = {
		hypercertId,
		saleStatus,
		totalUnits: typeCastApiResponseToBigInt(hypercert.units) ?? 0n,
		unitsForSale,
		uri: hypercert.uri ?? undefined,
		creationBlockTimestamp:
			typeCastApiResponseToBigInt(hypercert.creation_block_timestamp) ?? 0n,
		creatorAddress: hypercert.creator_address ?? "0x0",
		chainId:
			(hypercert.contract?.chain_id as string).toLowerCase() ?? undefined,
		metadata: {
			name: metadata?.name ?? undefined,
			description: metadata?.description ?? undefined,
			work: {
				scope: metadata?.work_scope ?? [],
				from: typeCastApiResponseToBigInt(metadata?.work_timeframe_from) ?? 0n,
				to: typeCastApiResponseToBigInt(metadata?.work_timeframe_to) ?? 0n,
			},
			contributors: (metadata?.contributors ?? []).map((contributor) =>
				contributor.toLowerCase(),
			),
		},
		cheapestOrder: {
			pricePerPercentInUSD,
		},
		orders: parsedOrders,
		sales: parsedSales,
		attestations: parsedAttestations,
	};
	return fullHypercert;
};

export type FullHypercertOrders = Exclude<FullHypercert["orders"], undefined>;
export type FullHypercertWithOrder = Omit<FullHypercert, "orders"> & {
	orders: FullHypercertOrders;
};
