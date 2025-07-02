import { catchError } from "@/app/utils";
import {
  type ApiError,
  fetchHypercertsGraphQL as fetchGraphQL,
} from "@/app/utils/graphql";
import { type ResultOf, graphql } from "gql.tada";
import { fetchHypercertIDs } from "./hypercerts";

const salesByHypercertByPeriod = graphql(`
  query SalesByHypercertByPeriod(
    $hypercert_id: String!
    $start: BigInt!
    $end: BigInt!
  ) {
    sales(
      where: {
        hypercert_id: { eq: $hypercert_id }
        creation_block_timestamp: { gt: $start, lte: $end }
      }
    ) {
      data {
        buyer
        transaction_hash
        currency
        creation_block_timestamp
        currency_amount
        hypercert {
          metadata {
            name
          }
          id
        }
      }
    }
  }
`);

type SalesDataByPeriodResponse = ResultOf<typeof salesByHypercertByPeriod>;

export type SalesByHypercert = {
  hypercertId: string;
  hypercertName: string;
  sales: {
    buyer: string;
    transactionHash: string;
    currency: string;
    currencyAmount: string;
    timestamp: number;
  }[];
};

export const fetchSalesDataByPeriod = async (
  start: number,
  end: number
): Promise<SalesByHypercert[]> => {
  const [hypercertIdsFetchError, hypercertIds] = await catchError<
    string[],
    ApiError
  >(fetchHypercertIDs());

  if (hypercertIdsFetchError || !hypercertIds) {
    throw hypercertIdsFetchError;
  }

  const salesDataPromises = hypercertIds.map((hypercertId) => {
    return fetchGraphQL(salesByHypercertByPeriod, {
      start,
      end,
      hypercert_id: hypercertId,
    });
  });

  const [error, response] = await catchError<
    SalesDataByPeriodResponse[],
    ApiError
  >(Promise.all(salesDataPromises));
  if (error) {
    throw error;
  }

  const result: SalesByHypercert[] = [];
  for (const hypercertSales of response) {
    const sales = hypercertSales.sales.data;
    if (sales === null || sales.length === 0) continue;

    const hypercertId = sales[0].hypercert?.id;
    if (!hypercertId) continue;

    result.push({
      hypercertId,
      hypercertName: sales[0].hypercert?.metadata?.name ?? "Untitled",
      sales: sales.map((sale) => ({
        buyer: sale.buyer,
        transactionHash: sale.transaction_hash,
        currency: sale.currency,
        currencyAmount: sale.currency_amount as string,
        timestamp: sale.creation_block_timestamp as number,
      })),
    });
  }

  return result;
};
