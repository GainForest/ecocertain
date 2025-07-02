// Hypercerts Endpoint Config:
const productionGraphQL = "https://api.hypercerts.org/v2/graphql";
const developmentGraphQL = "https://staging-api.hypercerts.org/v2/graphql";

const productionREST = "https://api.hypercerts.org/v2";
const developmentREST = "https://staging-api.hypercerts.org/v2";

const HYPERCERTS_API_URL_REST =
  process.env.NEXT_PUBLIC_DEPLOY_ENV === "production"
    ? productionREST
    : developmentREST;
const HYPERCERTS_API_URL =
  process.env.NEXT_PUBLIC_DEPLOY_ENV === "production"
    ? productionGraphQL
    : developmentGraphQL;

export const graphqlEndpoint = HYPERCERTS_API_URL;
export const restEndpoint = HYPERCERTS_API_URL_REST;

// ================================================
// ================================================
// ================================================
// Hypercerts Query Payload Config:

//@TODO: Update the collection ids for prod and dev:
const DEV_HYPERBOARD_ID = "3e42687a-ceeb-48f7-b8ab-99533ff0a81c";
const PROD_HYPERBOARD_ID = "3b781a5b-0783-4632-8f8f-8fdf67ed4454";

export const collectionId = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941";
export const hyperboardId =
  process.env.NEXT_PUBLIC_DEPLOY_ENV === "production"
    ? PROD_HYPERBOARD_ID
    : DEV_HYPERBOARD_ID;
