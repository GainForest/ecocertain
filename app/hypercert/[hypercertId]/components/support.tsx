import EthAddress from "@/components/eth-address";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EthAvatar from "@/components/ui/eth-avatar";
import { TOKENS_CONFIG } from "@/config/wagmi";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { formatTokens } from "@/lib/format-tokens";
import { bigintToFormattedDate } from "@/lib/utils";
import { Calendar, HandHeart } from "lucide-react";
import type React from "react";

const BuyFraction = ({
	text,
	hypercert,
}: {
	text: React.ReactNode;
	hypercert: FullHypercert;
}) => {
	return (
		<div className="d relative flex w-full flex-col items-center overflow-hidden px-8 py-4 pt-8">
			<div className="-bottom-20 absolute h-32 w-full rounded-full bg-gradient-to-r from-primary/20 to-primary/40 blur-xl" />
			<div className="relative flex items-center justify-center">
				<div className="absolute h-12 w-12 rounded-full bg-beige-muted-foreground/40 blur-lg" />
				<HandHeart
					size={50}
					className="scale-100 text-beige-muted-foreground"
				/>
			</div>
			<div className="mt-2 scale-100">{text}</div>
		</div>
	);
};

const Wrapper = ({
	children,
	buyFraction,
}: {
	children: React.ReactNode;
	buyFraction: React.ReactNode;
}) => {
	return (
		<div className="w-full overflow-hidden rounded-2xl border border-border bg-background">
			<section className="flex w-full flex-col gap-4 p-4">
				<h2 className="font-baskerville font-bold text-muted-foreground text-xl">
					Support
				</h2>
				{children}
			</section>
			{buyFraction}
		</div>
	);
};

const Support = ({ hypercert }: { hypercert: FullHypercert }) => {
	const salesCount = hypercert.sales?.length ?? 0;
	if (salesCount === 0) {
		return (
			<Wrapper
				buyFraction={
					<BuyFraction
						text={
							<p className="flex flex-col items-center justify-center text-center">
								<span className="font-bold text-lg">
									Be the pioneer, lead the way.
								</span>
								<span>
									Be the very first to support this hypercert by owning a piece.
								</span>
							</p>
						}
						hypercert={hypercert}
					/>
				}
				children={null}
			/>
		);
	}

	const addressToSymbol: Record<
		string,
		{
			symbol: string;
			decimals: number;
		}
	> = {};

	for (const chainId in TOKENS_CONFIG) {
		const tokens = TOKENS_CONFIG[chainId];
		for (const token of tokens) {
			addressToSymbol[token.address] = {
				symbol: token.symbol,
				decimals: token.decimals,
			};
		}
	}

	const newestToOldestSales = hypercert.sales.sort((a, b) => {
		return Number(b.creationBlockTimestamp - a.creationBlockTimestamp);
	});

	return (
		<Wrapper
			buyFraction={
				<BuyFraction
					text={
						<p className="flex flex-col items-center justify-center text-center">
							<span className="font-bold text-lg">
								Join the movement and make a difference.
							</span>
							<span>Grab your share of the hypercert today!</span>
						</p>
					}
					hypercert={hypercert}
				/>
			}
		>
			<div className="flex w-full flex-col gap-2">
				<ul className="flex w-full flex-col gap-1">
					{newestToOldestSales
						.map((sale) => {
							const saleCurrency = sale.currency;
							let currencySymbol: string;
							let currencyDecimals: number;
							if (
								saleCurrency in addressToSymbol &&
								addressToSymbol[saleCurrency]
							) {
								currencySymbol = addressToSymbol[saleCurrency].symbol;
								currencyDecimals = addressToSymbol[saleCurrency].decimals;
							} else {
								return null;
							}

							const saleAmount = formatTokens(
								sale.currencyAmount,
								currencyDecimals,
							);

							return (
								<li
									key={sale.transactionHash}
									className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-2"
								>
									<div className="flex items-center gap-4">
										<EthAvatar
											address={sale.buyer as `0x${string}`}
											size={40}
										/>
										<div className="flex h-full flex-col items-start gap-1">
											<EthAddress address={sale.buyer} />
											<span className="flex items-center text-muted-foreground text-sm">
												<Calendar size={14} className="mr-2" />
												<span>
													{bigintToFormattedDate(sale.creationBlockTimestamp)}
												</span>
											</span>
										</div>
									</div>
									<span className="text-right font-bold text-lg text-primary">
										<b>{saleAmount}</b> {currencySymbol}
									</span>
								</li>
							);
						})
						?.filter((sale) => sale !== null)}
				</ul>
			</div>
		</Wrapper>
	);
};

export default Support;
