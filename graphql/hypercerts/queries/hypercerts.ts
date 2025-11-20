import { hyperboardId } from "@/config/hypercerts";
import { typeCastApiResponseToBigInt } from "@/lib/utils";
import { type ResultOf } from "gql.tada";
import { tryCatch } from "@/lib/tryCatch";
import { fetchHypercertsGraphQL as fetchGraphQL, graphql } from "../";
import { hypercert } from "./templates";

const hypercertIdsByHyperboardIdQuery = graphql(`
  query GetHypercertIdsByHyperboardId($hyperboard_id: String!) {
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

export const fetchHypercertIDs = async (): Promise<string[]> => {
  try {
    const hypercertIds =
      process.env.NEXT_PUBLIC_TEMP_HYPERCERT_IDS_IN_HYPERBOARD?.split(",").map(
        (id) => id.trim()
      );
    if (hypercertIds) {
      return new Promise((res) => res(hypercertIds));
    }
  } catch (error) {
    console.error(error);
  }
  const [response, error] = await tryCatch(() =>
    fetchGraphQL(hypercertIdsByHyperboardIdQuery, {
      hyperboard_id: hyperboardId,
    })
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
    for (const section of hyperboard.sections?.data ?? []) {
      for (const entry of section.entries ?? []) {
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
  uri?: string;
  name?: string;
  description?: string;
  totalUnits: bigint;
  sales: {
    currency: string;
    currencyAmount: bigint; // in wei
    buyer?: string;
    creationBlockTimestamp?: bigint;
  }[];
  unitsForSale?: bigint;
  pricePerPercentInUSD?: number;
  buyerCount: number;
  creationBlockTimestamp: bigint;
  orderNonce?: number;
  orderId?: string;
};

export const fetchHypercertById = async (
  hypercertId: string
): Promise<Hypercert> => {
  const [response, error] = await tryCatch(() =>
    fetchGraphQL(hypercertByHypercertIdQuery, {
      hypercert_id: hypercertId,
    })
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
    hypercert.sales?.data?.map((sale) => sale.buyer as string) ?? []
  );

  const orderNonce = hypercert.orders?.data?.[0]?.orderNonce;

  const sales = hypercert.sales?.data ?? [];
  const parsedSales = sales.map((sale) => {
    return {
      currency: sale.currency,
      currencyAmount: typeCastApiResponseToBigInt(sale.currency_amount) ?? 0n,
      buyer: sale.buyer ?? undefined,
      creationBlockTimestamp:
        typeCastApiResponseToBigInt(sale.creation_block_timestamp) ?? 0n,
    };
  });

  return {
    hypercertId,
    creatorAddress: hypercert.creator_address as string,
    chainId: (hypercert.contract?.chain_id as string) ?? undefined,
    uri: hypercert.uri ?? undefined,
    name: hypercert.metadata?.name ?? undefined,
    description: hypercert.metadata?.description ?? undefined,
    totalUnits: typeCastApiResponseToBigInt(hypercert.units) ?? 0n,
    unitsForSale: typeCastApiResponseToBigInt(
      hypercert.orders?.totalUnitsForSale
    ),
    sales: parsedSales,
    pricePerPercentInUSD: pricePerPercentInUSDNumber,
    buyerCount: uniqueBuyers.size,
    creationBlockTimestamp:
      typeCastApiResponseToBigInt(hypercert.creation_block_timestamp) ?? 0n,
    orderNonce: orderNonce ? Number(orderNonce) : undefined,
    orderId: hypercert.orders?.data?.[0]?.id ?? undefined,
  };
};

export const fetchHypercerts = async () => {
  const [hypercertIds, hypercertIdFetchError] = await tryCatch(() =>
    fetchHypercertIDs()
  );
  if (hypercertIdFetchError) throw hypercertIdFetchError;

  const hypercertPromises = hypercertIds.map((hypercertId) =>
    fetchHypercertById(hypercertId)
  );
  const [hypercerts, error] = await tryCatch(() =>
    Promise.all(hypercertPromises)
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
            invalidated
            itemIds
          }
        }
        attestations {
          data {
            eas_schema {
              chain_id
              schema
              uid
            }
            attester
            creation_block_timestamp
            data
            schema_uid
            uid
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

type AttestationDataResponse = {
  title: string;
  chain_id: string;
  token_id: string;
  description: string;
  contract_address: string;
  sources: string[];
};

type AttestationData = Omit<AttestationDataResponse, "sources"> & {
  sources: {
    type: string;
    src: string;
    description?: string;
  }[];
};

export type EcocertAttestation = {
  uid: string;
  schema_uid: string;
  data: AttestationData;
  attester: string;
  creationBlockTimestamp: bigint;
};

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
    invalidated: boolean;
    itemIds: string[];
  }[];
  attestations: EcocertAttestation[];
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
  hypercertId: string
): Promise<FullHypercert> => {
  const [response, error] = await tryCatch(() =>
    fetchGraphQL(fullHypercertByHypercertIdQuery, {
      hypercert_id: hypercertId,
    })
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
      currency: order.currency as string,
      chainId: order.chainId as string,
      invalidated: order.invalidated,
      itemIds: order.itemIds,
    };
  });

  const sales = hypercert.sales?.data ?? [];
  const parsedSales = sales.map((sale) => {
    return {
      unitsBought: typeCastApiResponseToBigInt(sale.amounts?.[0] ?? 0) ?? 0n,
      buyer: sale.buyer,
      currency: sale.currency,
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
      if (
        attestation.eas_schema.uid !==
        "0x48e3e1be1e08084b408a7035ac889f2a840b440bbf10758d14fb722831a200c3"
      )
        return null;
      const data = attestation.data as AttestationDataResponse;
      const parsedData: AttestationData = {
        ...data,
        sources: data.sources.map((source) => JSON.parse(source)) as {
          type: string;
          src: string;
          description?: string;
        }[],
      };
      return {
        uid: attestation.uid ?? "",
        schema_uid: (attestation.schema_uid ?? "") as string,
        data: parsedData,
        attester: attestation.attester ?? "",
        creationBlockTimestamp:
          typeCastApiResponseToBigInt(attestation.creation_block_timestamp) ??
          0n,
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
        contributor.toLowerCase()
      ),
    },
    cheapestOrder: {
      pricePerPercentInUSD,
    },
    orders: parsedOrders,
    sales: parsedSales,
    attestations: parsedAttestations,
  } satisfies FullHypercert;
  return fullHypercert;
};

export type FullHypercertOrders = Exclude<FullHypercert["orders"], undefined>;
export type FullHypercertWithOrder = Omit<FullHypercert, "orders"> & {
  orders: FullHypercertOrders;
};
