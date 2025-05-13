import { fetchHypercertsGraphQL, graphql } from "@/graphql/hypercerts";
import { tryCatch } from "@/lib/try-catch";

const query = graphql(`
  query FractionsByHypercertQuery($hypercertId: String!) {
    fractions(where: { hypercert_id: { eq: $hypercertId } }) {
      data {
        fraction_id
        owner_address
        units
      }
    }
  }
`);

export type Fraction = {
  fractionId: string;
  ownerAddress: string;
  units: string;
};

export const fetchFractionsByHypercert = async (
  hypercertId: string
): Promise<Fraction[] | null> => {
  const [data, error] = await tryCatch(
    async () => await fetchHypercertsGraphQL(query, { hypercertId })
  );
  if (error || data.fractions.data === null) {
    console.error(
      "Error fetching fractions by hypercert",
      hypercertId,
      ":",
      error
    );
    return null;
  }
  const fractions = data.fractions.data;
  return fractions.map((fraction) => ({
    fractionId: fraction.fraction_id as string,
    ownerAddress: fraction.owner_address as string,
    units: fraction.units as string,
  }));
};
