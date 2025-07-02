import { typeCastApiResponseToBigInt } from "@/lib/utils";
import { readFragment, type ResultOf } from "gql.tada";
import { catchError } from "../../../app/utils";
import { fetchHypercertsGraphQL as fetchGraphQL } from "../";
import { graphql } from "@/graphql/hypercerts";
import { ApiError } from "next/dist/server/api-utils";
import { tryCatch } from "@/lib/try-catch";
import { HyperboardFragment } from "../fragments/hyperboard";

const hyperboardByIdQuery = graphql(
  `
    query GetHyperboardById($id: String!) {
      hyperboards(where: { id: { eq: $id } }) {
        count
        data {
          ...HyperboardFragment
        }
      }
    }
  `,
  [HyperboardFragment]
);

export type Hyperboard = {
  id: string;
  chainIds: number[];
  title: string;
  collection: {
    id: string;
    title: string;
    description: string;
    blueprints: {
      blueprintId: number;
      factor: number;
    }[];
    hypercerts: {
      hypercertId: string;
      factor: number;
    }[];
  } | null;
  backgroundImg?: string;
  borderColor: string;
};

export const fetchHyperboardById = async (id: string): Promise<Hyperboard> => {
  const [response, error] = await tryCatch(
    async () =>
      await fetchGraphQL(hyperboardByIdQuery, {
        id,
      })
  );
  if (error) {
    throw error;
  }

  const hyperboards = response.hyperboards.data;
  if (!hyperboards || hyperboards.length === 0)
    throw {
      message: "Hyperboard not found",
      type: "PAYLOAD",
    };

  const hyperboardFragment = hyperboards[0];
  const hyperboard = readFragment(HyperboardFragment, hyperboardFragment);

  const collections = hyperboard.sections.data[0].collections as Array<{
    name: string;
    description: string;
    id: string;
  }>;

  const entries = hyperboard.sections?.data?.[0]?.entries ?? [];

  const collection =
    collections.length === 0
      ? null
      : {
          id: collections[0].id,
          title: collections[0].name,
          description: collections[0].description ?? "",
          blueprints: entries
            .filter((entry) => entry.is_blueprint)
            .map((entry) => ({
              blueprintId: Number(entry.id),
              factor: entry.display_size,
            })),
          hypercerts: entries
            .filter((entry) => !entry.is_blueprint)
            .map((entry) => ({
              hypercertId: entry.id.toString(),
              factor: entry.display_size,
            })),
        };

  const hyperboardData = {
    id: id,
    chainIds: hyperboard.admins.data.map(
      (admin) => (admin as { chain_id: number }).chain_id
    ),
    title: hyperboard.name,
    collection: collection,
    backgroundImg: hyperboard.background_image ?? "",
    borderColor: hyperboard.tile_border_color ?? "#000000",
  } satisfies Hyperboard;

  return hyperboardData;
};
