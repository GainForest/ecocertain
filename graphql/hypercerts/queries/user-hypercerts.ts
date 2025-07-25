import { typeCastApiResponseToBigInt } from "@/lib/utils";
import { fetchHypercertsGraphQL as fetchGraphQL, graphql } from "../";
import { tryCatch } from "@/lib/tryCatch";
import type { Hypercert } from "./hypercerts";
import { hypercert } from "./templates";

const hypercertsByUserIdQuery = graphql(`
    query GetHypercertsByUserId($address: String!) {
      hypercerts(
        where: { creator_address: { contains: $address } }
        sortBy: { attestations_count: descending }
      ) {
        count
        ${hypercert}
      }
    }
  `);

export type UserHypercerts = {
  count: number;
  hypercerts: Hypercert[];
};

export const fetchHypercertsByUserId = async (
  address: string
): Promise<UserHypercerts> => {
  const [response, error] = await tryCatch(() =>
    fetchGraphQL(hypercertsByUserIdQuery, {
      address,
    })
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
      hypercert.sales?.data?.map((sale) => sale.buyer as string) ?? []
    );
    const orderNonce = hypercert.orders?.data?.[0]?.orderNonce;

    const sales = hypercert.sales?.data ?? [];
    const parsedSales = sales.map((sale) => {
      return {
        currency: sale.currency,
        currencyAmount: typeCastApiResponseToBigInt(sale.currency_amount) ?? 0n,
      };
    });
    return {
      hypercertId: hypercert.hypercert_id as string,
      creatorAddress: hypercert.creator_address as string,
      chainId: (hypercert.contract?.chain_id as string) ?? undefined,
      name: hypercert.metadata?.name ?? undefined,
      description: hypercert.metadata?.description ?? undefined,
      totalUnits: typeCastApiResponseToBigInt(hypercert.units) ?? 0n,
      unitsForSale: typeCastApiResponseToBigInt(
        hypercert.orders?.totalUnitsForSale as string
      ),
      pricePerPercentInUSD: pricePerPercentInUSDNumber,
      buyerCount: uniqueBuyers.size,
      creationBlockTimestamp:
        typeCastApiResponseToBigInt(hypercert.creation_block_timestamp) ?? 0n,
      orderNonce: orderNonce ? Number(orderNonce) : undefined,
      orderId: hypercert.orders?.data?.[0]?.id ?? undefined,
      sales: parsedSales,
    } satisfies Hypercert;
  });

  return {
    hypercerts: hypercertsData,
    count: hypercertsData.length ?? 0,
  };
};
