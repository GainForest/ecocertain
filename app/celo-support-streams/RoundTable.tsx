import { Button } from "@/components/ui/button";
import UserChip from "@/components/user-chip";
import type { SalesByHypercert } from "@/graphql/hypercerts/queries/period-sales";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { celo } from "viem/chains";

const RoundDataTable = ({ roundData }: { roundData: SalesByHypercert[] }) => {
	return (
		<table className="w-full">
			<thead className="border-b border-b-border">
				<tr>
					<th className="pb-2">Hypercert</th>
					<th className="pb-2">Amount</th>
					<th className="pb-2">Buyer</th>
					<th className="pb-2">View</th>
				</tr>
			</thead>
			<tbody>
				{roundData.map((saleByHypercert, hypercertIndex) =>
					saleByHypercert.sales.map((sale, saleIndex) => {
						const rowIndex = hypercertIndex + saleIndex;
						return (
							<tr
								key={saleByHypercert.hypercertId}
								className={
									rowIndex % 2 === 0 ? "bg-transparent" : "bg-background"
								}
							>
								<td>
									<Link href={`/hypercerts/${saleByHypercert.hypercertId}`}>
										{saleByHypercert.hypercertName.slice(0, 20)}...
									</Link>
								</td>
								<td>
									{`${(
										Number(BigInt(sale.currencyAmount) / BigInt(10 ** 10)) /
										10 ** 8
									).toFixed(2)} Celo`}
								</td>
								<td>
									<UserChip
										key={sale.transactionHash}
										address={sale.buyer as `0x${string}`}
										className="bg-transparent"
									/>
								</td>
								<td>
									<Link
										href={`${celo.blockExplorers.default.url}${sale.transactionHash}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Button variant={"outline"} size={"sm"} className="gap-2">
											View <ArrowUpRight size={14} />
										</Button>
									</Link>
								</td>
							</tr>
						);
					}),
				)}
			</tbody>
		</table>
	);
};

export default RoundDataTable;
