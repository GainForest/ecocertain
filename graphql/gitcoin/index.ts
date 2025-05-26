import { initGraphQLTada, TadaDocumentNode } from "gql.tada";
import type { introspection } from "./env.d.ts";
import { fetchGraphQL } from "../";

export const graphql = initGraphQLTada<{
  introspection: introspection;
}>();

export async function fetchGitcoinGraphql<ResponseType, VariablesType>(
  query: TadaDocumentNode<ResponseType, VariablesType, unknown>,
  variables?: VariablesType,
  testingLog?: string
): Promise<ResponseType> {
  if (testingLog) {
    console.log("calling from fetchGitcoinGraphql", testingLog);
  }
  return fetchGraphQL(
    "https://beta.indexer.gitcoin.co/v1/graphql",
    query,
    variables,
    testingLog
  );
}
