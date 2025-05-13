"use client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	GitcoinDonationEntry,
	type GitcoinEcocert,
} from "@/graphql/gitcoin/queries/round-35/gitcoin-ecocert";
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
	ClipboardCheck,
	Send,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import SupportGitcoinDonorsDialog from "./SupportGitcoinDonorsDialog";
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
	const { data: ecocert, isLoading: isEcocertLoading } = useQuery({
		queryKey: ["ecocert-data", ecocertId],
		queryFn: async () => {
			const ecocert = await fetchHypercertById(ecocertId);
			return ecocert;
		},
	});

	const ecocertName = ecocert?.name
		? `${ecocert.name.slice(0, 20)}...`
		: "Untitled";

	const alreadyTransferred =
		(gitcoinEcocert.ownerFractions ?? []).length >
			gitcoinEcocert.donations.length ||
		window.localStorage.getItem(
			`gitcoin-round-35-application-${gitcoinEcocert.applicationId}-completed`,
		) === "true";

	const { pricePerPercentInUSD } = ecocert ?? {};

	return (
		<AccordionItem key={ecocertId} value={ecocertId} className="px-4 py-2">
			<div className="flex items-center justify-between">
				<AccordionTrigger
					className="flex-1 py-0 hover:no-underline"
					outerClassName="flex-1 mr-2"
				>
					<div className="flex flex-1 items-center justify-between pr-4">
						{isEcocertLoading ? (
							<div className="h-4 w-20 animate-pulse rounded-lg bg-muted" />
						) : (
							<span className="flex items-center gap-4 text-left font-bold font-sans">
								<CircularProgressbar
									value={
										pricePerPercentInUSD
											? totalAmountInUSD / pricePerPercentInUSD
											: 33
									}
									text={
										pricePerPercentInUSD
											? `${(totalAmountInUSD / pricePerPercentInUSD).toFixed(
													0,
											  )}%`
											: ""
									}
									className="h-10 w-10"
									styles={{
										path: {
											stroke: "#22c55e",
											strokeLinecap: "round",
										},
										trail: {
											stroke: "#e5e7eb",
										},
										text: {
											fill: "#22c55e",
											fontSize: "32px",
											fontWeight: "bold",
											dominantBaseline: "central",
											textAnchor: "middle",
										},
									}}
								/>
								{ecocertName}
							</span>
						)}
						<span className="text-muted-foreground">
							${Number(totalAmountInUSD).toFixed(2)}
						</span>
					</div>
				</AccordionTrigger>
				{alreadyTransferred ? (
					<Button variant="secondary" size="sm" className="gap-1" disabled>
						Transfer
					</Button>
				) : (
					<SupportGitcoinDonorsDialog
						ecocertId={ecocertId}
						trigger={
							<Button variant="secondary" size="sm" className="gap-1">
								Transfer
							</Button>
						}
					/>
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
							{[...gitcoinEcocert.donations]
								.sort((a, b) => Number(b.amountInUsd) - Number(a.amountInUsd))
								.map((donation) => (
									<tr
										key={donation.transactionHash}
										className="border-border border-t"
									>
										<td className="max-w-[40px] truncate py-2 md:max-w-[80px]">
											<span className="text-muted-foreground text-sm">
												{donation.donorAddress}
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
											<div className="flex justify-center">
												<CircularProgressbar
													value={
														pricePerPercentInUSD
															? Number(donation.amountInUsd) /
															  pricePerPercentInUSD
															: 0
													}
													text={
														pricePerPercentInUSD
															? `${(
																	Number(donation.amountInUsd) /
																	pricePerPercentInUSD
															  ).toFixed(1)}%`
															: ""
													}
													className="h-8 w-8"
													styles={{
														path: {
															stroke: "#22c55e",
															strokeLinecap: "round",
														},
														trail: {
															stroke: "#e5e7eb",
														},
														text: {
															fill: "#22c55e",
															fontSize: "28px",
															fontWeight: "bold",
															dominantBaseline: "central",
															textAnchor: "middle",
														},
													}}
												/>
											</div>
										</td>
										<td className="py-2 text-right text-muted-foreground text-sm">
											${Number(donation.amountInUsd).toFixed(2)}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

const BatchTransferList = ({
	gitcoinEcocerts,
}: {
	gitcoinEcocerts: GitcoinEcocert[];
}) => {
	const sortedEcocerts = [...gitcoinEcocerts].sort((a, b) => {
		const aTransferred = (a.ownerFractions ?? []).length > a.donations.length;
		const bTransferred = (b.ownerFractions ?? []).length > b.donations.length;
		if (aTransferred === bTransferred) return 0;
		return aTransferred ? 1 : -1;
	});

	return (
		<div className="flex flex-col gap-2">
			<Accordion
				type="multiple"
				className="w-full rounded-xl border border-border bg-background"
			>
				{sortedEcocerts.map((gitcoinEcocert) => {
					if (gitcoinEcocert.donations.length === 0) {
						return null;
					}
					return (
						<GitcoinEcocertAccordionItem gitcoinEcocert={gitcoinEcocert} />
					);
				})}
			</Accordion>
		</div>
	);
};

export default BatchTransferList;
