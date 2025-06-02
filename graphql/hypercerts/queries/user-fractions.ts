import { typeCastApiResponseToBigInt } from "@/lib/utils";
import { type ResultOf } from "gql.tada";
import { catchError } from "../../../app/utils";
import { fetchHypercertsGraphQL as fetchGraphQL } from "../";
import { graphql } from "@/graphql/hypercerts";
import { ApiError } from "next/dist/server/api-utils";

const fractionsByOwnerIdQuery = graphql(`
  query GetFractionsByOwner($address: String!) {
    fractions(where: { owner_address: { contains: $address } }) {
      count
      data {
        id
        fraction_id
        owner_address
        units
        metadata {
          id
          name
          description
          image
          external_url
          work_scope
          contributors
          work_timeframe_from
          work_timeframe_to
        }
        hypercert_id
      }
    }
  }
`);

type FractionsByOwnerIdResponse = ResultOf<typeof fractionsByOwnerIdQuery>;

export type Fraction = {
  id: string;
  hypercertId?: string;
  fractionId?: string;
  ownerAddress?: string;
  units?: bigint;
  name?: string;
  description?: string;
  image?: string;
  contributors?: string[];
  work: {
    scope?: string[];
    from?: bigint;
    to?: bigint;
  };
};

export type OwnedFractions = {
  fractions: Fraction[];
  count: number;
};

export const fetchFractionsByOwnerId = async (
  address: string
): Promise<OwnedFractions> => {
  const [error, response] = await catchError<
    FractionsByOwnerIdResponse,
    ApiError
  >(
    fetchGraphQL(fractionsByOwnerIdQuery, {
      address,
    })
  );
  if (error) {
    throw error;
  }

  const fractions = response.fractions.data;
  if (!fractions)
    throw {
      message: "Fractions not found",
      type: "PAYLOAD",
    };

  const fractionsData = fractions.map((fraction) => {
    return {
      id: fraction.id,
      hypercertId: fraction.hypercert_id ?? undefined,
      fractionId: fraction.fraction_id ?? undefined,
      ownerAddress: fraction.owner_address ?? undefined,
      units: typeCastApiResponseToBigInt(fraction.units as string),
      name: fraction.metadata?.name ?? undefined,
      description: fraction.metadata?.description ?? undefined,
      image: fraction.metadata?.image ?? undefined,
      contributors: fraction.metadata?.contributors ?? undefined,
      work: {
        scope: fraction.metadata?.work_scope ?? undefined,
        from: typeCastApiResponseToBigInt(
          fraction.metadata?.work_timeframe_from as string
        ),
        to: typeCastApiResponseToBigInt(
          fraction.metadata?.work_timeframe_to as string
        ),
      },
    } satisfies Fraction;
  });

  return {
    fractions: fractionsData,
    count: response.fractions.count ?? 0,
  };
};
