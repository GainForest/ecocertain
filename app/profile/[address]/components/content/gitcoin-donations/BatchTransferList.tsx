"use client";
import PageError from "@/app/components/shared/PageError";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import QuickTooltip from "@/components/ui/quicktooltip";
import {
	type Fraction,
	fetchFractionsByHypercert,
} from "@/graphql/hypercerts/queries/fractions-by-hypercert";
import {
	fetchFullHypercertById,
	fetchHypercertById,
} from "@/graphql/hypercerts/queries/hypercerts";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowRight,
	ArrowUpRight,
	Check,
	ChevronDown,
	CircleAlert,
	ClipboardCheck,
	Send,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import SupportGitcoinDonorsDialog from "./SupportGitcoinDonorsDialog";
import { getNonOwnerFractions } from "./SupportGitcoinDonorsDialog/utils";
import type { GitcoinData } from "./hooks/use-gitcoin-data";
import { useGitcoinEcocerts } from "./hooks/use-gitcoin-ecocerts";

type GitcoinEcocert = GitcoinData & {
	allFractions: Fraction[] | null;
};

const GitcoinEcocertAccordionItem = ({
	gitcoinEcocert,
}: {
	gitcoinEcocert: GitcoinEcocert;
}) => {
	const { ecocertId } = gitcoinEcocert;
	const totalAmountInUSD = gitcoinEcocert.donations.reduce(
		(acc, donation) => acc + Number(donation.amountInUsd),
		0,
	);

	const { data: ecocert, isPending: isEcocertPending } = useQuery({
		queryKey: ["ecocert-data", ecocertId],
		queryFn: async () => {
			const ecocert = await fetchHypercertById(ecocertId);
			return ecocert;
		},
	});

	const ecocertName = ecocert?.name
		? ecocert.name.length > 24
			? `${ecocert.name.slice(0, 21)}...`
			: ecocert.name
		: "Untitled";

	const alreadyTransferred =
		getNonOwnerFractions(gitcoinEcocert).length >=
			gitcoinEcocert.donations.length ||
		window.localStorage.getItem(
			`gitcoin-round-35-application-${gitcoinEcocert.gitcoinApplicationId}-completed`,
		) === "true";

	const { pricePerPercentInUSD } = ecocert ?? {};

	const donations = structuredClone(gitcoinEcocert.donations);
	donations.sort((a, b) => Number(b.amountInUsd) - Number(a.amountInUsd));

	return (
		<AccordionItem value={ecocertId} className="px-4 py-2">
			<div className="flex items-center justify-between">
				<AccordionTrigger
					className="flex-1 py-0 hover:no-underline"
					outerClassName="flex-1 mr-2"
				>
					<div className="flex flex-1 items-center justify-between pr-4">
						{isEcocertPending ? (
							<div className="h-4 w-20 animate-pulse rounded-lg bg-muted" />
						) : (
							<span className="flex items-center gap-4 text-left font-bold font-sans">
								<CircularProgressbar
									value={
										pricePerPercentInUSD
											? totalAmountInUSD / pricePerPercentInUSD
											: 0
									}
									text={
										pricePerPercentInUSD
											? `${Math.min(
													totalAmountInUSD / pricePerPercentInUSD,
													100,
											  ).toFixed(0)}%`
											: "!"
									}
									className={"h-10 w-10"}
									styles={{
										path: {
											stroke: "#22c55e",
											strokeLinecap: "round",
										},
										trail: {
											stroke: "#e5e7eb",
										},
										text: {
											fill: pricePerPercentInUSD ? "#22c55e" : "#e50e0e",
											fontSize: "28px",
											fontWeight: "bold",
											dominantBaseline: "central",
											textAnchor: "middle",
										},
									}}
								/>
								<QuickTooltip content={ecocert?.name}>
									{ecocertName}
								</QuickTooltip>
							</span>
						)}
						<span className="text-muted-foreground">
							${Number(totalAmountInUSD).toFixed(2)}
						</span>
					</div>
				</AccordionTrigger>
				{isEcocertPending ? (
					<div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
				) : alreadyTransferred ? (
					<QuickTooltip asChild content="Already transferred">
						<Button variant={"outline"} size="sm" className="gap-1">
							<Check size={16} className="text-green-500" />
						</Button>
					</QuickTooltip>
				) : pricePerPercentInUSD ? (
					<SupportGitcoinDonorsDialog
						ecocertId={ecocertId}
						trigger={
							<Button size="sm" className="gap-1">
								Transfer
							</Button>
						}
					/>
				) : (
					<QuickTooltip asChild content="Ecocert not yet listed">
						<Button variant={"outline"} size="sm" className="gap-1">
							<CircleAlert size={16} className="text-red-500" />
						</Button>
					</QuickTooltip>
				)}
			</div>
			<AccordionContent>
				<div className="px-4 py-2">
					<table className="mx-auto w-full">
						<thead>
							<tr className="text-muted-foreground text-xs">
								<th className="py-2 text-left font-medium">Address</th>
								<th className="py-2 text-right font-medium">
									View on CeloScan
								</th>
								<th className="py-2 text-center font-medium">Percentage</th>
								<th className="py-2 text-right font-medium">Amount</th>
							</tr>
						</thead>
						<tbody>
							{donations.map((donation) => {
								return (
									<tr
										key={donation.transactionHash}
										className="border-border border-t"
									>
										<td className="py-2">
											<span className="text-muted-foreground text-sm">
												{`${donation.donor.slice(
													0,
													6,
												)}...${donation.donor.slice(-4)}`}
											</span>
										</td>
										<td className="py-2 text-right text-muted-foreground text-sm">
											<Link
												href={`https://explorer.celo.org/tx/${donation.transactionHash}`}
												target="_blank"
												rel="noopener noreferrer"
												className="transition-colors hover:text-primary"
											>
												<Button variant="link" size="sm" className="p-0">
													View <ArrowUpRight size={14} />
												</Button>
											</Link>
										</td>
										<td className="py-2 text-center">
											<span className="text-muted-foreground text-sm">
												{pricePerPercentInUSD
													? `${(
															Number(donation.amountInUsd) /
															pricePerPercentInUSD
													  ).toFixed(2)}%`
													: "-"}
											</span>
										</td>
										<td className="py-2 text-right text-muted-foreground text-sm">
											${Number(donation.amountInUsd).toFixed(2)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

const BatchTransferList = ({
	gitcoinDataArray,
}: {
	gitcoinDataArray: GitcoinData[];
}) => {
	const gitcoinEcocertIds = gitcoinDataArray.map((data) => data.ecocertId);
	const { data: gitcoinEcocerts, error: gitcoinEcocertsError } =
		useGitcoinEcocerts(gitcoinDataArray);

	const sortedEcocerts = gitcoinEcocerts
		? gitcoinEcocerts.sort((a, b) => {
				const aTransferred =
					getNonOwnerFractions(a).length - a.donations.length;
				const bTransferred =
					getNonOwnerFractions(b).length - b.donations.length;
				return aTransferred - bTransferred;
		  })
		: null;

	if (gitcoinEcocertsError) {
		return (
			<PageError
				title="Something went wrong..."
				body="We were unable to get the ecocerts."
				showHome={false}
				showRefresh={false}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{sortedEcocerts ? (
				<Accordion
					type="multiple"
					className="w-full rounded-xl border border-border bg-background"
				>
					{sortedEcocerts.map((gitcoinEcocert) => {
						if (gitcoinEcocert.donations.length === 0) {
							return null;
						}
						return (
							<GitcoinEcocertAccordionItem
								gitcoinEcocert={gitcoinEcocert}
								key={gitcoinEcocert.ecocertId}
							/>
						);
					})}
				</Accordion>
			) : (
				<div className="w-full divide-y rounded-xl border border-border bg-background">
					{gitcoinEcocertIds.map((ecocertId) => {
						return (
							<div
								className="flex w-full items-center justify-between px-4 py-2"
								key={ecocertId}
							>
								<div className="flex items-center gap-2">
									<div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
									<div className="h-8 w-52 animate-pulse rounded-lg bg-muted" />
								</div>
								<div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default BatchTransferList;
