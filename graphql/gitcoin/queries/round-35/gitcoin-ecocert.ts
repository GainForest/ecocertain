import { fetchGitcoinGraphql, graphql } from "@/graphql/gitcoin";
import ecocertMappings from "./ecocert-mappings.json";
import {
  fetchFractionsByHypercert,
  Fraction,
} from "@/graphql/hypercerts/queries/fractions-by-hypercert";
import { tryCatch } from "@/lib/try-catch";
const query = graphql(`
  query DonationsByApplicationQuery($applicationId: String!) {
    applications(
      limit: 1
      where: {
        status: { _eq: APPROVED }
        chainId: { _eq: 42220 }
        id: { _eq: $applicationId }
        roundId: { _eq: "35" }
      }
    ) {
      donations {
        amount
        amountInRoundMatchToken
        amountInUsd
        donorAddress
        tokenAddress
        transactionHash
      }
    }
  }
`);

export type GitcoinDonationEntry = {
  amount: string;
  amountInRoundMatchToken: string;
  amountInUsd: string;
  donorAddress: string;
  tokenAddress: string;
  transactionHash: string;
};

export type GitcoinEcocert = {
  applicationId: string;
  ecocertId: string;
  donations: GitcoinDonationEntry[];
  ownerFractions: Fraction[] | null;
};

export const fetchGitcoinEcocert = async (
  applicationId: string
): Promise<GitcoinEcocert | null> => {
  const ecocertId = ecocertMappings.find(
    (mapping) => mapping.gitcoinApplicationId === applicationId
  )?.ecocertId;

  if (!ecocertId) {
    return null;
  }

  const donationsDataPromise = fetchGitcoinGraphql(query, { applicationId });
  const fractionsDataPromise = fetchFractionsByHypercert(ecocertId);

  const [data, error] = await tryCatch(
    async () => await Promise.all([donationsDataPromise, fractionsDataPromise])
  );

  if (error) {
    console.error(
      "Error fetching donations by application",
      applicationId,
      ":",
      error
    );
    return null;
  }

  const [donationsData, fractionsData] = data;
  const donations = donationsData.applications[0].donations;

  const gitcoinEcocert: GitcoinEcocert = {
    applicationId,
    ecocertId,
    donations: donations.map((donation) => ({
      amount: donation.amount as string,
      amountInRoundMatchToken: donation.amountInRoundMatchToken as string,
      amountInUsd: donation.amountInUsd as string,
      donorAddress: donation.donorAddress as string,
      tokenAddress: donation.tokenAddress as string,
      transactionHash: donation.transactionHash as string,
    })),
    ownerFractions: fractionsData,
  };

  return gitcoinEcocert;
};

export const fetchMultipleGitcoinEcocerts = async (
  applicationIds: string[]
): Promise<(GitcoinEcocert | null)[]> => {
  const donationsPromises = Promise.all(
    applicationIds.map((id) => fetchGitcoinEcocert(id))
  );

  const donationsByMultipleApplications = await donationsPromises;

  return donationsByMultipleApplications;
};
