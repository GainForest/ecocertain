import { fetchHypercertsGraphQL as fetchGraphQL, graphql } from "../";
import { tryCatch } from "@/lib/tryCatch";

const salesByPeriodQuery = graphql(`
  query SalesByPeriod($start: BigInt!, $end: BigInt!) {
    sales(
      where: {
        creation_block_timestamp: { gt: $start, lte: $end }
      }
    ) {
      data {
        currency
        currency_amount
        buyer
        creation_block_timestamp
        hypercert_id
      }
    }
  }
`);

export type SaleRecord = {
  currency: string;
  currencyAmount: bigint;
  buyer: string;
  timestamp: bigint;
  hypercertId?: string;
};

const parseBigInt = (value: unknown): bigint => {
	if (typeof value === "bigint") return value;
	if (typeof value === "number") return BigInt(Math.floor(value));
	if (typeof value === "string") return BigInt(value);
	return 0n;
};

export const fetchSalesByPeriod = async (
	start: bigint,
	end: bigint,
): Promise<SaleRecord[]> => {
  const [response, error] = await tryCatch(() =>
    fetchGraphQL(salesByPeriodQuery, {
      start: Number(start),
      end: Number(end),
    }),
  );
  if (error) {
    throw error;
  }

	const sales = response.sales.data ?? [];
	return sales.map((sale) => ({
		currency: sale.currency,
		currencyAmount: parseBigInt(sale.currency_amount),
		buyer: sale.buyer ?? "0x0",
		timestamp: parseBigInt(sale.creation_block_timestamp),
		hypercertId: sale.hypercert_id ?? undefined,
	}));
};

const attestationsByPeriodQuery = graphql(`
  query AttestationsByPeriod(
    $start: BigInt!
    $end: BigInt!
  ) {
    attestations(
      where: {
        creation_block_timestamp: { gt: $start, lte: $end }
      }
    ) {
      count
    }
  }
`);

export const fetchAttestationCountByPeriod = async (
	start: bigint,
	end: bigint,
): Promise<number> => {
	const [response, error] = await tryCatch(() =>
		fetchGraphQL(attestationsByPeriodQuery, {
			start: Number(start),
			end: Number(end),
		}),
	);
	if (error) {
		console.warn("Failed to fetch attestation counts", error);
		return 0;
	}

	return response.attestations.count ?? 0;
};
